/**
 * Outbound notifications to customers and kitchen staff.
 *
 * WhatsApp only allows free-form messages within 24h of the recipient's last
 * message to us. Outside that window we fall back to an approved template
 * (see docs/WHATSAPP_SETUP.md → “Templates”).
 */
import { q } from "@/lib/db";
import { inr } from "@/lib/menu";
import { sendButtons, sendTemplate, sendText, type Button } from "@/lib/whatsapp/client";
import { orderCode, type Order } from "@/lib/orders";

const WINDOW_MS = 23.5 * 60 * 60 * 1000;

export async function isWindowOpen(waId: string) {
  const [r] = await q<{ last_inbound_at: string | null }>`select last_inbound_at from contacts where wa_id = ${waId}`;
  return !!r?.last_inbound_at && Date.now() - new Date(r.last_inbound_at).getTime() < WINDOW_MS;
}

export function staffNumbers(): string[] {
  return (process.env.STAFF_WHATSAPP_NUMBERS || "")
    .split(",")
    .map((s) => s.replace(/\D/g, ""))
    .filter(Boolean);
}
export const isStaff = (waId: string) => staffNumbers().includes(waId);

/** Never throws — a failed notification must not roll back an order. */
async function safe<T>(label: string, fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (e) {
    console.error(`[notify] ${label} failed:`, (e as Error).message);
    return undefined;
  }
}

// ── Customer ──────────────────────────────────────────────────
export async function tellCustomer(waId: string, text: string, orderRef?: string) {
  return safe("tellCustomer", async () => {
    const tpl = process.env.WHATSAPP_TEMPLATE_ORDER_UPDATE; // body: "Update on order {{1}}: {{2}}"
    if (tpl && !(await isWindowOpen(waId))) {
      return sendTemplate(waId, tpl, process.env.WHATSAPP_TEMPLATE_LANG || "en", [orderRef ?? "", text.replace(/\n+/g, " ")]);
    }
    return sendText(waId, text);
  });
}

// ── Staff ─────────────────────────────────────────────────────
export function staffCardText(o: Order, headline?: string) {
  const items = o.items.map((i) => `• ${i.qty} × ${i.name}${i.note ? ` (${i.note})` : ""}`).join("\n");
  const where =
    o.order_type === "delivery"
      ? `🛵 DELIVERY\n📍 ${o.address}${o.location ? `\n🗺️ https://maps.google.com/?q=${o.location.latitude},${o.location.longitude}` : ""}`
      : "🛍️ PICKUP";
  const pay =
    o.payment_status === "paid"
      ? "Paid ✅"
      : o.payment_method === "cod"
        ? "💵 COLLECT CASH on delivery"
        : "💵 COLLECT at pickup";
  return [
    headline ?? `🔔 *New order ${orderCode(o)}*`,
    `Status: *${o.status.replace(/_/g, " ")}*`,
    "",
    items,
    "",
    `Total: *${inr(o.total)}* — ${pay}`,
    where,
    `👤 ${o.customer_name} · wa.me/${o.wa_id}`,
    o.notes ? `📝 ${o.notes}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

/** Next-step buttons for the kitchen (WhatsApp allows max 3). */
export function staffButtons(o: Order): Button[] {
  const id = (a: string) => `ord:${a}:${o.id}`;
  const payBtn: Button[] = o.payment_status === "pending" ? [{ id: id("paid"), title: "💰 Payment received" }] : [];
  switch (o.status) {
    case "placed":
      return [{ id: id("accept"), title: "✅ Accept" }, { id: id("reject"), title: "❌ Reject" }];
    case "accepted":
      return [{ id: id("prepare"), title: "👨‍🍳 Start preparing" }, { id: id("cancel"), title: "Cancel" }];
    case "preparing":
      return [
        o.order_type === "delivery"
          ? { id: id("dispatch"), title: "🛵 Out for delivery" }
          : { id: id("ready"), title: "🛍️ Ready for pickup" },
        ...payBtn,
      ].slice(0, 3);
    case "ready":
    case "out_for_delivery":
      return [{ id: id("complete"), title: o.order_type === "delivery" ? "📦 Delivered" : "📦 Picked up" }, ...payBtn];
    case "completed":
      return payBtn;
    default:
      return [];
  }
}

/** Send one staff member the order card with the right buttons. */
export async function sendStaffCard(to: string, o: Order, headline?: string) {
  const body = staffCardText(o, headline);
  const buttons = staffButtons(o);
  if (await isWindowOpen(to)) {
    return buttons.length ? sendButtons(to, body, buttons) : sendText(to, body);
  }
  // Staff window closed → approved template with quick-reply buttons.
  const tpl = process.env.WHATSAPP_TEMPLATE_STAFF_ORDER; // 5 vars; 2 quick-reply buttons
  if (!tpl) {
    console.warn(
      `[notify] staff ${to} window closed and WHATSAPP_TEMPLATE_STAFF_ORDER unset — order ${orderCode(o)} only visible in /admin`
    );
    return undefined;
  }
  return sendTemplate(
    to,
    tpl,
    process.env.WHATSAPP_TEMPLATE_LANG || "en",
    [orderCode(o), o.items.map((i) => `${i.qty}x ${i.name}`).join(", "), String(o.total), o.order_type, o.customer_name],
    [`ord:accept:${o.id}`, `ord:reject:${o.id}`]
  );
}

export async function notifyStaffNewOrder(o: Order, kind: "new" | "cancelled" = "new") {
  const headline = kind === "cancelled" ? `❌ *Customer cancelled ${orderCode(o)}*` : undefined;
  await Promise.all(staffNumbers().map((n) => safe(`staff ${n}`, () => sendStaffCard(n, o, headline))));
}

export async function notifyStaffText(text: string) {
  await Promise.all(staffNumbers().map((n) => safe(`staff text ${n}`, () => sendText(n, text))));
}
