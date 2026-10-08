/**
 * The agent's tools. The model proposes; the server disposes — prices, totals,
 * business rules and the “customer confirmed” gate are all enforced here.
 */
import { tool } from "ai";
import { z } from "zod";
import { menu } from "@/data/menu";
import { restaurant, fullAddress } from "@/data/restaurant";
import { agentConfig } from "@/data/agent";
import { categoryList, categoryText, dot, getItem, inr, searchItems } from "@/lib/menu";
import { openStatus } from "@/lib/hours";
import {
  cartText,
  clearCheckout,
  deliveryFeeFor,
  getSession,
  patchSession,
  priceCart,
  reviewHash,
  saveCart,
} from "@/lib/session";
import {
  applyAction,
  createOrder,
  describeOrder,
  orderCode,
  ordersForCustomer,
  parseOrderCode,
} from "@/lib/orders";
import { notifyStaffNewOrder, notifyStaffText } from "@/lib/notify";
import { track } from "@/lib/analytics";
import {
  sendButtons,
  sendCtaUrl,
  sendImage,
  sendList,
  sendLocationRequest,
  sendText,
} from "@/lib/whatsapp/client";

export type AgentCtx = { waId: string; customerName?: string };

export function buildTools(ctx: AgentCtx) {
  const { waId } = ctx;
  const L = agentConfig.limits;

  return {
    // ───────────────────────── information ─────────────────────────
    get_business_info: tool({
      description: "Opening status, hours, address, phone, delivery rules. Use for any question about the restaurant.",
      inputSchema: z.object({}),
      execute: async () => {
        const o = openStatus();
        return {
          openNow: o.open,
          acceptingOrdersNow: o.acceptingOrders,
          hours: restaurant.hours,
          address: fullAddress(),
          phone: restaurant.phoneDisplay,
          delivery: agentConfig.delivery,
          eta: agentConfig.etaMinutes,
          serviceOptions: restaurant.goodToKnow[0].items,
        };
      },
    }),

    send_location_link: tool({
      description: "Send the restaurant's Google Maps link as a tappable button.",
      inputSchema: z.object({}),
      execute: async () => {
        await track("menu_viewed", { waId, props: { what: "map" } });
        await sendCtaUrl(waId, `📍 ${restaurant.name}\n${fullAddress()}`, "Open in Maps", restaurant.mapLink);
        return "Sent map link.";
      },
    }),

    // ───────────────────────── menu browsing ───────────────────────
    send_category_list: tool({
      description: "Send an interactive list of menu categories so the customer can tap one.",
      inputSchema: z.object({}),
      execute: async () => {
        await track("menu_viewed", { waId, props: { what: "categories" } });
        await sendList(
          waId,
          "What are you craving? Pick a category 👇",
          "See menu",
          [
            {
              title: "Menu",
              rows: categoryList.map((c) => ({
                id: `cat:${c.id}`,
                title: `${c.icon} ${c.label}`,
                description: `${c.count} items`,
              })),
            },
          ]
        );
        return "Category list sent.";
      },
    }),

    send_category_menu: tool({
      description: "Send the full item list with prices for one category as a text message.",
      inputSchema: z.object({ category_id: z.enum(menu.map((c) => c.id) as [string, ...string[]]) }),
      execute: async ({ category_id }) => {
        const text = categoryText(category_id);
        if (!text) return "Unknown category.";
        await track("menu_viewed", { waId, props: { what: "category", category: category_id } });
        await sendText(waId, text);
        return `Sent ${category_id} menu.`;
      },
    }),

    send_item_picker: tool({
      description:
        "Send a tappable list (10 items per page) of a category. Tapped items arrive as '[Selected: …]'. Use page 2,3… for more.",
      inputSchema: z.object({
        category_id: z.enum(menu.map((c) => c.id) as [string, ...string[]]),
        page: z.number().int().min(1).default(1),
      }),
      execute: async ({ category_id, page }) => {
        const c = menu.find((x) => x.id === category_id)!;
        await track("menu_viewed", { waId, props: { what: "picker", category: category_id, page } });
        const per = 9; // leave room for a “More…” row
        const start = (page - 1) * per;
        const slice = c.items.slice(start, start + per);
        if (!slice.length) return "No more items.";
        const rows = slice.map((i) => ({
          id: `item:${i.id}`,
          title: i.name,
          description: `${dot(i)} ${inr(i.price)}${i.name.length > 24 ? ` · ${i.name}` : ""}`,
        }));
        const hasMore = start + per < c.items.length;
        if (hasMore) rows.push({ id: `more:${category_id}:${page + 1}`, title: "More items ➡️", description: `Page ${page + 1}` });
        await sendList(waId, `${c.icon} ${c.label} — tap an item to add it`, "Choose item", [
          { title: c.label, rows },
        ]);
        return `Picker sent (page ${page}${hasMore ? ", more pages exist" : ""}).`;
      },
    }),

    send_item_photo: tool({
      description: "Send the photo + description of one menu item.",
      inputSchema: z.object({ item_id: z.string() }),
      execute: async ({ item_id }) => {
        const i = getItem(item_id);
        if (!i) return "Unknown item id.";
        await track("item_viewed", { waId, props: { item_id: i.id, name: i.name } });
        await sendImage(
          waId,
          i.image,
          `${dot(i)} *${i.name}* — ${inr(i.price)}\n${i.description}`
        );
        return "Photo sent.";
      },
    }),

    search_menu: tool({
      description: "Find menu items by name/keyword. Returns ids + prices for add_to_cart. Not shown to the customer.",
      inputSchema: z.object({ query: z.string(), veg_only: z.boolean().optional(), non_veg_only: z.boolean().optional() }),
      execute: async ({ query, veg_only, non_veg_only }) => {
        const veg = veg_only ? true : non_veg_only ? false : undefined;
        const res = searchItems(query, { veg, limit: 8 });
        await track("menu_search", { waId, props: { query: query.slice(0, 100), results: res.length } });
        return res.map((i) => ({ id: i.id, name: i.name, price: i.price, veg: i.veg, category: i.categoryLabel }));
      },
    }),

    // ───────────────────────── cart ────────────────────────────────
    add_to_cart: tool({
      description: "Add one or more items to the cart (quantity adds to any existing quantity).",
      inputSchema: z.object({
        items: z
          .array(
            z.object({
              item_id: z.string(),
              qty: z.number().int().min(1).max(L.maxQtyPerItem).default(1),
              note: z.string().max(120).optional().describe("e.g. 'no onion', 'extra spicy'"),
            })
          )
          .min(1),
      }),
      execute: async ({ items }) => {
        const s = await getSession(waId);
        const cart = [...s.cart];
        const rejected: string[] = [];
        for (const raw of items) {
          const it = { ...raw, qty: raw.qty ?? 1 };
          if (!getItem(it.item_id)) {
            rejected.push(it.item_id);
            continue;
          }
          const added = getItem(it.item_id)!;
          await track("cart_add", { waId, props: { item_id: added.id, name: added.name, qty: it.qty, price: added.price } });
          const ex = cart.find((l) => l.id === it.item_id && (l.note ?? "") === (it.note ?? ""));
          if (ex) ex.qty = Math.min(L.maxQtyPerItem, ex.qty + it.qty);
          else cart.push({ id: it.item_id, qty: it.qty, ...(it.note ? { note: it.note } : {}) });
        }
        if (cart.reduce((n, l) => n + l.qty, 0) > L.maxItemsPerOrder) {
          return "Too many items for a single order — suggest handover_to_human for bulk orders.";
        }
        await saveCart(waId, cart);
        const fresh = await getSession(waId);
        return { cart: cartText(fresh), unknownItemIds: rejected };
      },
    }),

    remove_from_cart: tool({
      description: "Remove an item, or reduce its quantity.",
      inputSchema: z.object({ item_id: z.string(), qty: z.number().int().min(1).optional() }),
      execute: async ({ item_id, qty }) => {
        await track("cart_remove", { waId, props: { item_id, qty: qty ?? "all" } });
        const s = await getSession(waId);
        const cart = s.cart
          .map((l) => (l.id === item_id ? { ...l, qty: qty ? l.qty - qty : 0 } : l))
          .filter((l) => l.qty > 0);
        await saveCart(waId, cart);
        return cartText(await getSession(waId));
      },
    }),

    clear_cart: tool({
      description: "Empty the cart.",
      inputSchema: z.object({}),
      execute: async () => {
        await saveCart(waId, []);
        return "Cart cleared.";
      },
    }),

    view_cart: tool({
      description: "Current cart contents and totals (for your reference; doesn't message the customer).",
      inputSchema: z.object({}),
      execute: async () => cartText(await getSession(waId)),
    }),

    // ───────────────────────── checkout ────────────────────────────
    set_checkout_details: tool({
      description: "Save checkout details as the customer provides them. Only pass fields the customer actually gave.",
      inputSchema: z.object({
        order_type: z.enum(agentConfig.orderTypes).optional(),
        customer_name: z.string().min(1).max(60).optional(),
        address: z.string().min(5).max(300).optional().describe("Full delivery address incl. landmark"),
        payment_method: z.enum(agentConfig.paymentMethods).optional().describe("cod for delivery, pay_at_pickup for pickup"),
      }),
      execute: async (p) => {
        await patchSession(waId, {
          ...(p.order_type ? { order_type: p.order_type } : {}),
          ...(p.customer_name ? { customer_name: p.customer_name } : {}),
          ...(p.address ? { address: p.address } : {}),
          ...(p.payment_method ? { payment_method: p.payment_method } : {}),
        });
        // changing details invalidates a prior review
        await patchSession(waId, { review_hash: null });
        const s = await getSession(waId);
        const missing = [
          !s.order_type && "order_type",
          !s.customer_name && "customer_name",
          s.order_type === "delivery" && !s.address && "address",
          !s.payment_method && "payment_method",
        ].filter(Boolean);
        return { saved: true, stillMissing: missing };
      },
    }),

    request_location: tool({
      description: "Show WhatsApp's 'Send location' button so a delivery customer can share their pin.",
      inputSchema: z.object({}),
      execute: async () => {
        await sendLocationRequest(waId, "📍 Tap below to share your delivery location pin (you can also type your address).");
        return "Location request sent.";
      },
    }),

    send_quick_replies: tool({
      description: "Offer up to 3 tappable reply buttons (e.g. Delivery / Pickup, Yes / No).",
      inputSchema: z.object({
        body: z.string().max(900),
        buttons: z.array(z.object({ id: z.string().max(40), title: z.string().max(20) })).min(1).max(3),
      }),
      execute: async ({ body, buttons }) => {
        await sendButtons(waId, body, buttons.map((b) => ({ id: `qr:${b.id}`, title: b.title })));
        return "Buttons sent.";
      },
    }),

    review_order: tool({
      description:
        "Validate the checkout and show the customer a summary with Confirm / Change / Cancel buttons. Required before place_order.",
      inputSchema: z.object({}),
      execute: async () => {
        const s = await getSession(waId);
        const { lines, subtotal } = priceCart(s.cart);
        const problems: string[] = [];
        const open = openStatus();
        if (!open.acceptingOrders) problems.push("Restaurant is not accepting orders right now.");
        if (!lines.length) problems.push("Cart is empty.");
        if (!s.order_type) problems.push("Need order_type (delivery or pickup).");
        if (!s.customer_name) problems.push("Need customer_name.");
        if (s.order_type === "delivery" && !s.address) problems.push("Need delivery address.");
        if (!s.payment_method) problems.push("Need payment_method.");
        if (s.order_type === "delivery" && subtotal < agentConfig.delivery.minOrder)
          problems.push(`Delivery minimum is ${inr(agentConfig.delivery.minOrder)} (subtotal ${inr(subtotal)}).`);
        if (s.order_type === "pickup" && s.payment_method === "cod") problems.push("Pickup orders use pay_at_pickup.");
        if (s.order_type === "delivery" && s.payment_method === "pay_at_pickup") problems.push("Delivery orders use cod.");
        if (subtotal > L.maxOrderValue) problems.push("Order value too large — use handover_to_human.");
        if (problems.length) {
          await track("order_blocked", { waId, props: { problems, subtotal } });
          return { shown: false, problems };
        }

        await patchSession(waId, { review_hash: reviewHash(s) });
        await track("order_reviewed", { waId, props: { subtotal, order_type: s.order_type, payment: s.payment_method } });
        const fee = deliveryFeeFor(subtotal, s.order_type);
        const where =
          s.order_type === "delivery" ? `🛵 Delivery to: ${s.address}` : "🛍️ Pickup at the restaurant";
        const pay = s.payment_method === "cod" ? "💵 Cash on delivery" : "💵 Pay at pickup";
        await sendButtons(
          waId,
          `🧾 *Please confirm your order*\n\n${cartText(s)}\n\n👤 ${s.customer_name}\n${where}\n${pay}\n⏱️ ~${agentConfig.etaMinutes[s.order_type!]} min`,
          [
            { id: "confirm_order", title: "✅ Confirm order" },
            { id: "change_order", title: "✏️ Change" },
            { id: "cancel_draft", title: "❌ Cancel" },
          ]
        );
        return { shown: true, total: subtotal + fee, note: "Wait for the customer to confirm." };
      },
    }),

    place_order: tool({
      description:
        "Place the order. ONLY after review_order was shown AND the customer confirmed that exact summary. Fails if anything changed since the review.",
      inputSchema: z.object({ notes: z.string().max(200).optional().describe("Special instructions for the kitchen") }),
      execute: async ({ notes }) => {
        const s = await getSession(waId);
        if (!s.review_hash || s.review_hash !== reviewHash(s)) {
          return { placed: false, error: "Order not reviewed (or changed since review). Call review_order first and wait for confirmation." };
        }
        if (!openStatus().acceptingOrders) return { placed: false, error: "Restaurant stopped accepting orders." };
        const { subtotal } = priceCart(s.cart);
        if (subtotal > L.maxOrderValue) return { placed: false, error: "Order too large; use handover_to_human." };

        const order = await createOrder(s, notes);
        await clearCheckout(waId);
        await track("order_placed", {
          waId,
          orderId: order.id,
          props: { total: order.total, order_type: order.order_type, payment: order.payment_method, item_count: order.items.reduce((n, i) => n + i.qty, 0) },
        });
        await notifyStaffNewOrder(order);
        await sendText(
          waId,
          `🎉 *Order placed!* Your code is *${orderCode(order)}*\n\n${describeOrder(order)}\n\nWe've sent it to the kitchen. I'll message you as soon as it's confirmed and at every step 🙌`
        );
        return { placed: true, code: orderCode(order), total: order.total, note: "Customer already notified." };
      },
    }),

    // ───────────────────────── after-order ─────────────────────────
    get_order_status: tool({
      description: "Status of the customer's latest orders (or a specific code like PWB1004).",
      inputSchema: z.object({ order_code: z.string().optional() }),
      execute: async ({ order_code }) => {
        const orders = await ordersForCustomer(waId, 5);
        const pick = order_code
          ? orders.filter((o) => orderCode(o) === order_code.toUpperCase())
          : orders.slice(0, 2);
        if (!pick.length) return "No orders found for this customer.";
        return pick.map(describeOrder).join("\n\n");
      },
    }),

    cancel_order: tool({
      description: "Cancel the customer's order — only works before the kitchen has accepted it.",
      inputSchema: z.object({ order_code: z.string() }),
      execute: async ({ order_code }) => {
        const id = parseOrderCode(order_code);
        const mine = id !== null ? (await ordersForCustomer(waId, 10)).find((o) => o.id === id) : undefined;
        if (!mine) return { cancelled: false, error: "No such order on this number." };
        const r = await applyAction(mine.id, "cancel", "customer");
        return r.ok ? { cancelled: true, note: "Customer notified automatically." } : { cancelled: false, error: r.error };
      },
    }),

    handover_to_human: tool({
      description:
        "Pause the bot and alert staff. Use for complaints, refunds, allergies, bulk orders, anything you can't resolve.",
      inputSchema: z.object({ reason: z.string().max(200) }),
      execute: async ({ reason }) => {
        await track("handover", { waId, props: { reason } });
        const until = new Date(Date.now() + L.handoverHours * 3600_000).toISOString();
        await patchSession(waId, { handover_until: until });
        await notifyStaffText(
          `🙋 *Customer needs a human*\n${ctx.customerName ?? "Customer"} · wa.me/${waId}\nReason: ${reason}`
        );
        await sendText(
          waId,
          `I've asked our team to help you personally 🙏 They'll reach out shortly. You can also call us at ${restaurant.phoneDisplay}.`
        );
        return "Staff alerted; customer informed. Bot is paused for this customer.";
      },
    }),
  };
}
