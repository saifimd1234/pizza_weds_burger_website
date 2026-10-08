/**
 * Orders: creation, the status state-machine, and payment marking.
 * Every status change (from the customer, WhatsApp staff buttons, or the
 * /admin board) goes through `applyAction`, so the customer is always told.
 */
import { json, q } from "@/lib/db";
import { agentConfig } from "@/data/agent";
import { restaurant } from "@/data/restaurant";
import { inr } from "@/lib/menu";
import { tellCustomer, notifyStaffNewOrder } from "@/lib/notify";
import { deliveryFeeFor, priceCart, type Session } from "@/lib/session";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "rejected"
  | "cancelled";

export type Order = {
  id: number;
  wa_id: string;
  customer_name: string;
  order_type: "delivery" | "pickup";
  address: string | null;
  location: { latitude: number; longitude: number } | null;
  notes: string | null;
  items: { id: string; name: string; price: number; qty: number; note?: string }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: "cod" | "pay_at_pickup" | "online";
  payment_status: "pending" | "paid" | "refunded";
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export const orderCode = (o: Pick<Order, "id">) => `PWB${1000 + o.id}`;
export const parseOrderCode = (s: string) => {
  const m = s.trim().toUpperCase().match(/^PWB(\d+)$/);
  return m ? Number(m[1]) - 1000 : null;
};

export const ACTIVE_STATUSES: OrderStatus[] = ["placed", "accepted", "preparing", "ready", "out_for_delivery"];

// ── Create ────────────────────────────────────────────────────
export async function createOrder(s: Session, notes?: string): Promise<Order> {
  const { lines, subtotal } = priceCart(s.cart);
  if (!lines.length) throw new Error("Cart is empty");
  if (!s.order_type || !s.customer_name || !s.payment_method) {
    throw new Error("Missing order type, name or payment method");
  }
  if (s.order_type === "delivery" && !s.address) throw new Error("Missing delivery address");

  const fee = deliveryFeeFor(subtotal, s.order_type);
  const items = lines.map(({ id, name, price, qty, note }) => ({ id, name, price, qty, ...(note ? { note } : {}) }));
  const [order] = await q<Order>`
    insert into orders (wa_id, customer_name, order_type, address, location, notes, items,
                        subtotal, delivery_fee, total, payment_method)
    values (${s.wa_id}, ${s.customer_name}, ${s.order_type}, ${s.address},
            ${s.location ? json(s.location) : null}, ${notes ?? null},
            ${json(items)}, ${subtotal}, ${fee}, ${subtotal + fee}, ${s.payment_method})
    returning *`;
  await logEvent(order.id, "status", "placed", "customer");
  return order;
}

export async function getOrder(id: number) {
  const [o] = await q<Order>`select * from orders where id = ${id}`;
  return o ?? null;
}

export async function ordersForCustomer(waId: string, limit = 3) {
  return q<Order>`select * from orders where wa_id = ${waId} order by id desc limit ${limit}`;
}

export async function activeOrders() {
  return q<Order>`select * from orders where status = any(${ACTIVE_STATUSES}) order by id asc`;
}

async function logEvent(orderId: number, kind: "status" | "payment", value: string, actor: string) {
  await q`insert into order_events (order_id, kind, value, actor) values (${orderId}, ${kind}, ${value}, ${actor})`;
}

// ── State machine ─────────────────────────────────────────────
export type OrderAction =
  | "accept"
  | "reject"
  | "prepare"
  | "ready"
  | "dispatch"
  | "complete"
  | "cancel"
  | "paid";

const TRANSITIONS: Record<Exclude<OrderAction, "paid">, { from: OrderStatus[]; to: OrderStatus }> = {
  accept: { from: ["placed"], to: "accepted" },
  reject: { from: ["placed"], to: "rejected" },
  prepare: { from: ["accepted"], to: "preparing" },
  ready: { from: ["preparing"], to: "ready" },
  dispatch: { from: ["preparing"], to: "out_for_delivery" },
  complete: { from: ["ready", "out_for_delivery"], to: "completed" },
  cancel: { from: ["placed", "accepted", "preparing"], to: "cancelled" },
};

export type ActionResult =
  | { ok: true; order: Order; changed: boolean }
  | { ok: false; error: string; order?: Order };

export async function applyAction(
  orderId: number,
  action: OrderAction,
  actor: string,
  opts: { reason?: string } = {}
): Promise<ActionResult> {
  const current = await getOrder(orderId);
  if (!current) return { ok: false, error: "Order not found" };

  // ── payment ──
  if (action === "paid") {
    if (current.status === "cancelled" || current.status === "rejected") {
      return { ok: false, error: "Order is cancelled", order: current };
    }
    if (current.payment_status === "paid") return { ok: true, order: current, changed: false };
    const [o] = await q<Order>`update orders set payment_status='paid', paid_at=now(), updated_at=now()
      where id=${orderId} and payment_status='pending' returning *`;
    if (!o) return { ok: true, order: (await getOrder(orderId))!, changed: false };
    await logEvent(orderId, "payment", "paid", actor);
    await tellCustomer(
      o.wa_id,
      `💰 Payment of *${inr(o.total)}* received for order *${orderCode(o)}*. Thank you!`,
      orderCode(o)
    );
    return { ok: true, order: o, changed: true };
  }

  // ── status ──
  const t = TRANSITIONS[action];
  if (action === "ready" && current.order_type !== "pickup") return { ok: false, error: "Use dispatch for delivery orders", order: current };
  if (action === "dispatch" && current.order_type !== "delivery") return { ok: false, error: "Use ready for pickup orders", order: current };
  if (actor === "customer" && action === "cancel" && current.status !== "placed") {
    return { ok: false, error: "Order already accepted by the kitchen", order: current };
  }

  const [o] = await q<Order>`update orders set status=${t.to}, updated_at=now()
    where id=${orderId} and status = any(${t.from}) returning *`;
  if (!o) {
    return { ok: false, error: `Already ${current.status.replace(/_/g, " ")}`, order: current };
  }
  await logEvent(orderId, "status", t.to, actor);
  await tellCustomer(o.wa_id, customerMessage(o, opts.reason), orderCode(o));
  if (action === "cancel" && actor === "customer") await notifyStaffNewOrder(o, "cancelled");
  return { ok: true, order: o, changed: true };
}

function customerMessage(o: Order, reason?: string): string {
  const c = orderCode(o);
  const eta = agentConfig.etaMinutes[o.order_type];
  switch (o.status) {
    case "accepted":
      return `✅ Order *${c}* is confirmed by our kitchen!\nEstimated time: *${eta} min* ⏱️`;
    case "preparing":
      return `👨‍🍳🔥 Your order *${c}* is being freshly prepared.`;
    case "ready":
      return `🛍️ Order *${c}* is *ready for pickup*! Please show this code at the counter.`;
    case "out_for_delivery":
      return `🛵 Order *${c}* is *out for delivery* — it'll be with you shortly!`;
    case "completed":
      return o.order_type === "delivery"
        ? `🎉 Order *${c}* delivered. Enjoy your meal! Thanks for choosing ${restaurant.name} ❤️`
        : `🎉 Order *${c}* picked up. Enjoy! Thanks for choosing ${restaurant.name} ❤️`;
    case "rejected":
      return `😔 Sorry, we couldn't accept order *${c}*${reason ? ` (${reason})` : " right now"}. Please try again later or call us.`;
    case "cancelled":
      return `❌ Order *${c}* has been cancelled${reason ? ` (${reason})` : ""}.`;
    default:
      return `Order *${c}* status: ${o.status}`;
  }
}

// ── Customer-facing summaries ─────────────────────────────────
export function describeOrder(o: Order) {
  const items = o.items.map((i) => `• ${i.qty} × ${i.name}`).join("\n");
  const pay =
    o.payment_status === "paid"
      ? "Paid ✅"
      : o.payment_method === "cod"
        ? "Cash on delivery"
        : "Pay at pickup";
  return `*${orderCode(o)}* — ${o.status.replace(/_/g, " ")}\n${items}\nTotal: ${inr(o.total)} (${pay})`;
}
