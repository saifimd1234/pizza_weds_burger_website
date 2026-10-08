/**
 * Per-customer session: cart + checkout draft + processing lock.
 */
import { createHash } from "node:crypto";
import { json, q } from "@/lib/db";
import { agentConfig } from "@/data/agent";
import { getItem, inr } from "@/lib/menu";

export type CartLine = { id: string; qty: number; note?: string };

export type Session = {
  wa_id: string;
  cart: CartLine[];
  order_type: "delivery" | "pickup" | null;
  address: string | null;
  location: { latitude: number; longitude: number } | null;
  customer_name: string | null;
  payment_method: "cod" | "pay_at_pickup" | null;
  review_hash: string | null;
  handover_until: string | null;
};

export async function getSession(waId: string): Promise<Session> {
  await q`insert into sessions (wa_id) values (${waId}) on conflict (wa_id) do nothing`;
  const [row] = await q<Session>`select * from sessions where wa_id = ${waId}`;
  return row;
}

type Patch = Partial<
  Pick<Session, "order_type" | "address" | "location" | "customer_name" | "payment_method" | "review_hash" | "handover_until">
>;

export async function patchSession(waId: string, p: Patch) {
  // Explicit per-column updates keep this injection-safe without dynamic SQL.
  if ("order_type" in p) await q`update sessions set order_type=${p.order_type ?? null}, updated_at=now() where wa_id=${waId}`;
  if ("address" in p) await q`update sessions set address=${p.address ?? null}, updated_at=now() where wa_id=${waId}`;
  if ("location" in p) await q`update sessions set location=${p.location ? json(p.location) : null}, updated_at=now() where wa_id=${waId}`;
  if ("customer_name" in p) await q`update sessions set customer_name=${p.customer_name ?? null}, updated_at=now() where wa_id=${waId}`;
  if ("payment_method" in p) await q`update sessions set payment_method=${p.payment_method ?? null}, updated_at=now() where wa_id=${waId}`;
  if ("review_hash" in p) await q`update sessions set review_hash=${p.review_hash ?? null}, updated_at=now() where wa_id=${waId}`;
  if ("handover_until" in p) await q`update sessions set handover_until=${p.handover_until ?? null}, updated_at=now() where wa_id=${waId}`;
}

export async function saveCart(waId: string, cart: CartLine[]) {
  // Any cart change invalidates a previous “confirm this order” review.
  await q`update sessions set cart=${json(cart)}, review_hash=null, updated_at=now() where wa_id=${waId}`;
}

export async function clearCheckout(waId: string) {
  await q`update sessions set cart='[]'::jsonb, review_hash=null, order_type=null, address=null, location=null, payment_method=null, updated_at=now() where wa_id=${waId}`;
}

// ── Cart maths (prices ALWAYS come from data/menu.ts) ─────────
export function priceCart(cart: CartLine[]) {
  const lines = cart.flatMap((l) => {
    const item = getItem(l.id);
    return item
      ? [{ id: item.id, name: item.name, price: item.price, qty: l.qty, note: l.note, veg: item.veg }]
      : [];
  });
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return { lines, subtotal, count: lines.reduce((s, l) => s + l.qty, 0) };
}

export function deliveryFeeFor(subtotal: number, orderType: string | null) {
  if (orderType !== "delivery") return 0;
  const d = agentConfig.delivery;
  return subtotal >= d.freeAbove ? 0 : d.fee;
}

export function cartText(s: Session) {
  const { lines, subtotal } = priceCart(s.cart);
  if (!lines.length) return "Cart is empty.";
  const fee = deliveryFeeFor(subtotal, s.order_type);
  const body = lines
    .map((l) => `• ${l.qty} × ${l.name} — ${inr(l.price * l.qty)}${l.note ? ` (${l.note})` : ""}`)
    .join("\n");
  const feeLine =
    s.order_type === "delivery"
      ? `\nDelivery: ${fee ? inr(fee) : "FREE"}`
      : "";
  return `${body}\n\nSubtotal: ${inr(subtotal)}${feeLine}\n*Total: ${inr(subtotal + fee)}*`;
}

/** Hash of everything the customer approves in the review step. */
export function reviewHash(s: Session) {
  const { lines } = priceCart(s.cart);
  const payload = JSON.stringify({
    l: lines.map((l) => [l.id, l.qty, l.note ?? ""]),
    t: s.order_type,
    a: s.address,
    n: s.customer_name,
    p: s.payment_method,
  });
  return createHash("sha1").update(payload).digest("hex");
}

// ── Concurrency: serialise processing per customer ────────────
export async function acquireLock(waId: string, waitMs = 25_000): Promise<boolean> {
  await q`insert into sessions (wa_id) values (${waId}) on conflict (wa_id) do nothing`;
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    const rows = await q`update sessions set lock_until = now() + interval '60 seconds'
      where wa_id = ${waId} and (lock_until is null or lock_until < now())
      returning wa_id`;
    if (rows.length) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

export async function releaseLock(waId: string) {
  await q`update sessions set lock_until = null where wa_id = ${waId}`;
}
