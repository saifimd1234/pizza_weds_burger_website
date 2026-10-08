/** Offline checks for the pure logic (no DB / network). `npm run selftest` */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
process.env.WHATSAPP_APP_SECRET = "shh";

import { parseWebhook, verifySignature } from "@/lib/whatsapp/webhook";
import { openStatus } from "@/lib/hours";
import { searchItems, categoryText, allItems } from "@/lib/menu";
import { priceCart, deliveryFeeFor, reviewHash, cartText, type Session } from "@/lib/session";
import { parseOrderCode, orderCode } from "@/lib/orders";
import { staffButtons, staffCardText } from "@/lib/notify";
import { clip } from "@/lib/whatsapp/client";

let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log("✔", name); };

t("signature accepts good, rejects bad/missing", () => {
  const body = '{"a":1}';
  const sig = "sha256=" + createHmac("sha256", "shh").update(body).digest("hex");
  assert.equal(verifySignature(body, sig), true);
  assert.equal(verifySignature(body + " ", sig), false);
  assert.equal(verifySignature(body, "sha256=deadbeef"), false);
  assert.equal(verifySignature(body, null), false);
});

t("parseWebhook: text, button, list, location, status", () => {
  const mk = (messages: any[], statuses: any[] = []) => ({
    object: "whatsapp_business_account",
    entry: [{ changes: [{ field: "messages", value: { contacts: [{ wa_id: "9198", profile: { name: "Asha" } }], messages, statuses } }] }],
  });
  const ev = parseWebhook(mk([
    { id: "w1", from: "9198", timestamp: "1", type: "text", text: { body: "hi" } },
    { id: "w2", from: "9198", timestamp: "2", type: "interactive", interactive: { type: "button_reply", button_reply: { id: "confirm_order", title: "Confirm" } } },
    { id: "w3", from: "9198", timestamp: "3", type: "interactive", interactive: { type: "list_reply", list_reply: { id: "item:pz-margherita", title: "Margherita" } } },
    { id: "w4", from: "9198", timestamp: "4", type: "button", button: { payload: "ord:accept:5", text: "Accept" } },
    { id: "w5", from: "9198", timestamp: "5", type: "location", location: { latitude: 22.8, longitude: 86.2 } },
    { id: "w6", from: "9198", timestamp: "6", type: "audio", audio: { id: "m1" } },
  ], [{ id: "out1", status: "failed", timestamp: "7", recipient_id: "9198", errors: [{ code: 131047, title: "Re-engagement" }] }]));
  assert.equal(ev.length, 7);
  assert.deepEqual((ev[0] as any).text, "hi");
  assert.equal((ev[0] as any).name, "Asha");
  assert.equal((ev[1] as any).reply.id, "confirm_order");
  assert.equal((ev[2] as any).reply.id, "item:pz-margherita");
  assert.equal((ev[3] as any).reply.id, "ord:accept:5");
  assert.equal((ev[4] as any).location.latitude, 22.8);
  assert.equal((ev[5] as any).media.type, "audio");
  assert.equal((ev[6] as any).error, "131047: Re-engagement");
  assert.deepEqual(parseWebhook({ object: "page" }), []);
});

t("opening hours incl. past-midnight Friday", () => {
  // 2026-10-09 is a Friday. IST = UTC+5:30
  const ist = (d: string) => new Date(d + "+05:30");
  assert.equal(openStatus(ist("2026-10-09T10:00:00")).open, false);
  assert.equal(openStatus(ist("2026-10-09T12:00:00")).open, true);
  assert.equal(openStatus(ist("2026-10-10T00:30:00")).open, true);   // Fri late night
  assert.equal(openStatus(ist("2026-10-10T00:50:00")).acceptingOrders, false); // <20 min left
  assert.equal(openStatus(ist("2026-10-10T01:10:00")).open, false);
  assert.equal(openStatus(ist("2026-10-07T23:30:00")).open, false);  // Wed closes 23:00
  assert.equal(openStatus(ist("2026-10-07T22:45:00")).acceptingOrders, false);
});

t("menu search resolves names, veg filter", () => {
  assert.equal(searchItems("bbq chicken pizza")[0]?.id === undefined, false);
  assert.equal(searchItems("margherita")[0].id, "pz-margherita");
  assert.ok(searchItems("pizza", { veg: true }).every((i) => i.veg));
  assert.equal(searchItems("zzzz").length, 0);
  assert.ok(categoryText("burgers")!.includes("Zinger"));
});

t("cart pricing uses menu prices, ignores unknown ids", () => {
  const p = priceCart([{ id: "pz-margherita", qty: 2 }, { id: "sd-fries", qty: 1 }, { id: "FAKE", qty: 9 }]);
  assert.equal(p.subtotal, 179 * 2 + 79);
  assert.equal(p.lines.length, 2);
  assert.equal(deliveryFeeFor(498, "delivery"), 30);
  assert.equal(deliveryFeeFor(499, "delivery"), 0);
  assert.equal(deliveryFeeFor(100, "pickup"), 0);
});

t("review hash changes when anything the customer approved changes", () => {
  const base: Session = { wa_id: "1", cart: [{ id: "pz-margherita", qty: 1 }], order_type: "delivery", address: "A", location: null, customer_name: "N", payment_method: "cod", review_hash: null, handover_until: null };
  const h = reviewHash(base);
  assert.equal(reviewHash({ ...base }), h);
  assert.notEqual(reviewHash({ ...base, cart: [{ id: "pz-margherita", qty: 2 }] }), h);
  assert.notEqual(reviewHash({ ...base, address: "B" }), h);
  assert.notEqual(reviewHash({ ...base, payment_method: null }), h);
  assert.ok(cartText(base).includes("Total"));
});

t("order codes round-trip", () => {
  assert.equal(orderCode({ id: 7 }), "PWB1007");
  assert.equal(parseOrderCode("pwb1007"), 7);
  assert.equal(parseOrderCode("hello"), null);
});

t("staff buttons per state respect WhatsApp's 3-button / 20-char limits", () => {
  const base: any = { id: 3, wa_id: "91", customer_name: "A", order_type: "delivery", address: "x", location: null, notes: null, items: [{ id: "a", name: "A", price: 1, qty: 1 }], subtotal: 1, delivery_fee: 0, total: 1, payment_method: "cod", payment_status: "pending", status: "placed" };
  for (const type of ["delivery", "pickup"]) for (const status of ["placed", "accepted", "preparing", "ready", "out_for_delivery", "completed", "cancelled"]) for (const pay of ["pending", "paid"]) {
    const b = staffButtons({ ...base, order_type: type, status, payment_status: pay });
    assert.ok(b.length <= 3, `${type}/${status}/${pay}`);
    for (const x of b) { assert.ok(clip(x.title, 20).length <= 20); assert.ok(x.id.length <= 256); }
  }
  assert.equal(staffButtons({ ...base, status: "completed", payment_status: "paid" }).length, 0);
  assert.ok(staffCardText(base).includes("PWB1003"));
});

t("all menu ids unique; list-row limits handled by clip()", () => {
  assert.equal(new Set(allItems.map((i) => i.id)).size, allItems.length);
  assert.equal(clip("x".repeat(40), 24).length, 24);
});

console.log(`\n${n} checks passed`);
