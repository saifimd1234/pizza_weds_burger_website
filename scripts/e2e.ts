/**
 * Local end-to-end test: real app code + real Postgres engine (PGlite) + mocked WhatsApp API.
 * Covers the order lifecycle, staff taps, payment, analytics views and CSV export.
 * Does NOT call the AI model.   npm run e2e
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const PORT = 54329;
const CUSTOMER = "919111111111";
const STAFF = "919000000001";
Object.assign(process.env, {
  DATABASE_URL: `postgres://postgres@127.0.0.1:${PORT}/postgres`,
  WHATSAPP_ACCESS_TOKEN: "test",
  WHATSAPP_PHONE_NUMBER_ID: "123",
  STAFF_WHATSAPP_NUMBERS: STAFF,
  ADMIN_PASSWORD: "x",
});

// ── mock Graph API ──────────────────────────────────────────
type Sent = { to: string; type: string; text: string; raw: any };
const sent: Sent[] = [];
let n = 0;
globalThis.fetch = (async (url: any, init: any) => {
  assert.ok(String(url).startsWith("https://graph.facebook.com/"), "unexpected fetch " + url);
  const b = JSON.parse(init.body);
  if (b.status === "read") return new Response("{}", { status: 200 });
  const text = b.text?.body ?? b.interactive?.body?.text ?? b.image?.caption ?? b.template?.name ?? "";
  sent.push({ to: b.to, type: b.interactive ? "interactive:" + b.interactive.type : b.type, text, raw: b });
  return new Response(JSON.stringify({ messages: [{ id: `wamid.${++n}` }] }), { status: 200 });
}) as any;
const last = (to: string) => [...sent].reverse().find((s) => s.to === to);
const since = (i: number) => sent.slice(i);

let checks = 0;
const ok = (name: string) => {
  checks++;
  console.log("✔", name);
};

async function main() {
  const db = await PGlite.create();
  const server = new PGLiteSocketServer({ db, port: PORT, host: "127.0.0.1" });
  await server.start();

  const { raw, q, sql } = await import("@/lib/db");
  const { agentConfig } = await import("@/data/agent");
  for (const d of Object.keys(agentConfig.hours)) (agentConfig.hours as any)[d] = { open: 0, close: 48 }; // always open
  await raw(readFileSync("db/schema.sql", "utf8"));
  await raw(readFileSync("db/analytics.sql", "utf8"));
  await raw(readFileSync("db/schema.sql", "utf8")); // idempotent re-run
  ok("schema + analytics views apply (and re-apply) cleanly");

  const { buildTools } = await import("@/lib/agent/tools");
  const { handleEvents } = await import("@/lib/handler");
  const { getSession, acquireLock, releaseLock } = await import("@/lib/session");
  const { getOrder } = await import("@/lib/orders");
  const { parseWebhook } = await import("@/lib/whatsapp/webhook");

  const tools: any = buildTools({ waId: CUSTOMER, customerName: "Asha" });
  const run = (name: string, input: any = {}) => tools[name].execute(input, { toolCallId: "t", messages: [] });
  const staffMsg = (id: string, p: any) => ({ kind: "message" as const, id, from: STAFF, timestamp: 1, ...p });

  // ── search + cart ──
  const found = await run("search_menu", { query: "barbeque chicken pizza" });
  assert.equal(found[0].id, "pz-bbq-chicken");
  assert.deepEqual(await run("search_menu", { query: "sushi" }), []);
  await run("add_to_cart", { items: [{ item_id: "pz-bbq-chicken", qty: 2 }, { item_id: "sd-fries" }, { item_id: "NOPE" }] });
  let s = await getSession(CUSTOMER);
  assert.equal(s.cart.length, 2);
  ok("search + add_to_cart (unknown ids rejected)");

  // ── gating ──
  let r = await run("review_order");
  assert.equal(r.shown, false);
  assert.ok(r.problems.length >= 3);
  r = await run("place_order", {});
  assert.equal(r.placed, false);
  await run("set_checkout_details", { order_type: "delivery", customer_name: "Asha", address: "12 Main Rd, Sakchi", payment_method: "cod" });
  r = await run("review_order");
  assert.equal(r.shown, true);
  assert.equal(r.total, 249 * 2 + 79); // subtotal 577 >= 499 -> free delivery
  const reviewMsg = last(CUSTOMER)!;
  assert.equal(reviewMsg.type, "interactive:button");
  assert.equal(reviewMsg.raw.interactive.action.buttons.length, 3);
  await run("add_to_cart", { items: [{ item_id: "sd-fries" }] }); // change after review
  assert.equal((await run("place_order", {})).placed, false);
  ok("place_order refuses unreviewed / changed-since-review carts");

  await run("review_order");
  await handleEvents([staffMsg("w.s0", { text: "hi" })]); // staff opens their 24h window
  assert.ok(last(STAFF)!.text.includes("staff bot"));
  const before = sent.length;
  r = await run("place_order", { notes: "extra spicy" });
  assert.equal(r.placed, true);
  assert.equal(r.code, "PWB1001");
  assert.equal(typeof (await getOrder(1))!.id, "number");
  ok("order placed; ids are numbers; code PWB1001");

  const fresh = since(before);
  assert.ok(fresh.some((m) => m.to === STAFF && m.type === "interactive:button" && m.text.includes("PWB1001") && m.text.includes("COLLECT CASH")));
  assert.ok(fresh.some((m) => m.to === CUSTOMER && m.text.includes("Order placed")));
  s = await getSession(CUSTOMER);
  assert.equal(s.cart.length, 0);
  ok("staff got button card; customer got confirmation; cart cleared");

  // ── staff taps drive the lifecycle ──
  const tap = async (id: string, action: string) => {
    const i = sent.length;
    await handleEvents([staffMsg(id, { reply: { id: `ord:${action}:1`, title: action } })]);
    return since(i);
  };
  let out = await tap("w.t1", "accept");
  assert.ok(out.some((m) => m.to === CUSTOMER && m.text.includes("confirmed by our kitchen")));
  assert.ok(out.some((m) => m.to === STAFF && m.text.includes("accepted")));
  out = await tap("w.t1b", "accept"); // double tap
  assert.ok(out.every((m) => m.to !== CUSTOMER));
  assert.ok(out.some((m) => m.to === STAFF && m.text.includes("Already")));
  ok("accept notifies customer once; double-tap is harmless");

  const cancelRes = await run("cancel_order", { order_code: "PWB1001" });
  assert.equal(cancelRes.cancelled, false);
  ok("customer cannot cancel after kitchen accepted");

  out = await tap("w.t2", "prepare");
  assert.ok(out.some((m) => m.to === CUSTOMER && m.text.includes("freshly prepared")));
  out = await tap("w.t3", "ready"); // wrong action for a delivery order
  assert.ok(out.every((m) => m.to !== CUSTOMER));
  out = await tap("w.t4", "dispatch");
  assert.ok(out.some((m) => m.to === CUSTOMER && m.text.includes("out for delivery")));
  out = await tap("w.t5", "paid");
  assert.ok(out.some((m) => m.to === CUSTOMER && m.text.includes("Payment of") && m.text.includes("received")));
  out = await tap("w.t6", "complete");
  assert.ok(out.some((m) => m.to === CUSTOMER && m.text.includes("delivered")));
  const o = (await getOrder(1))!;
  assert.equal(o.status, "completed");
  assert.equal(o.payment_status, "paid");
  ok("prepare -> dispatch -> paid -> delivered, each notifies the customer");

  // ── dedupe + status webhooks ──
  const c0 = sent.length;
  await handleEvents([staffMsg("w.dup", { text: "orders" }), staffMsg("w.dup", { text: "orders" })]);
  assert.equal(since(c0).length, 1);
  ok("duplicate webhook delivery processed once");

  const wamid = (await q<{ wa_message_id: string }>`select wa_message_id from messages where wa_id=${CUSTOMER} and direction='out' order by id limit 1`)[0].wa_message_id;
  const mkStatus = (status: string) =>
    parseWebhook({ object: "whatsapp_business_account", entry: [{ changes: [{ field: "messages", value: { statuses: [{ id: wamid, status, timestamp: "1", recipient_id: CUSTOMER }] } }] }] });
  await handleEvents(mkStatus("read"));
  await handleEvents(mkStatus("delivered")); // late / out-of-order -> must not downgrade
  assert.equal((await q<{ status: string }>`select status from messages where wa_message_id=${wamid}`)[0].status, "read");
  ok("delivery receipts update message status, never downgrade");

  // ── customer side without the model ──
  const a0 = sent.length;
  await handleEvents([{ kind: "message", id: "w.aud", from: CUSTOMER, timestamp: 1, media: { type: "audio", id: "m" } }]);
  assert.ok(since(a0).some((m) => m.to === CUSTOMER && m.text.includes("voice notes")));
  await run("handover_to_human", { reason: "refund request" });
  assert.ok(sent.some((m) => m.to === STAFF && m.text.includes("needs a human")));
  const h0 = sent.length;
  await handleEvents([{ kind: "message", id: "w.h1", from: CUSTOMER, timestamp: 2, text: "hello?" }]);
  assert.equal(sent.length, h0, "bot must stay silent during handover");
  await handleEvents([staffMsg("w.s9", { text: `resume ${CUSTOMER}` })]);
  assert.equal((await getSession(CUSTOMER)).handover_until, null);
  ok("voice-note reply; handover pauses bot; staff 'resume' un-pauses");

  // ── second order: cancelled by customer before acceptance ──
  await run("add_to_cart", { items: [{ item_id: "bg-veg-classic", qty: 2 }] }); // 178 >= 149 min
  await run("set_checkout_details", { order_type: "pickup", payment_method: "pay_at_pickup" });
  await run("review_order");
  const p2 = await run("place_order", {});
  assert.equal(p2.code, "PWB1002");
  const c2 = await run("cancel_order", { order_code: "PWB1002" });
  assert.equal(c2.cancelled, true);
  assert.equal((await getOrder(2))!.status, "cancelled");
  ok("customer can cancel before acceptance (pickup order)");

  // ── delivery minimum enforced ──
  await run("add_to_cart", { items: [{ item_id: "sw-veg" }] }); // 79 < 149
  await run("set_checkout_details", { order_type: "delivery", address: "somewhere nice 1", payment_method: "cod" });
  r = await run("review_order");
  assert.equal(r.shown, false);
  assert.ok(r.problems.some((p: string) => p.includes("minimum")));
  ok("delivery minimum order enforced");

  // ── agent loop wiring with a scripted model (tool schemas, loop, reply, usage tracking) ──
  const { MockLanguageModelV4 } = await import("ai/test");
  const { runAgent } = await import("@/lib/agent/run");
  const RAVI = "919333333333";
  await q`insert into messages (wa_id, direction, role, wa_message_id, content) values (${RAVI}, 'in', 'user', 'w.ravi1', 'one margherita pizza please')`;
  const usage = {
    inputTokens: { total: 1200, noCache: 1200, cacheRead: undefined, cacheWrite: undefined },
    outputTokens: { total: 40, text: 40, reasoning: undefined },
  };
  const mock = new MockLanguageModelV4({
    doGenerate: [
      {
        content: [{ type: "tool-call", toolCallId: "c1", toolName: "add_to_cart", input: '{"items":[{"item_id":"pz-margherita","qty":1}]}' }],
        finishReason: { unified: "tool-calls", raw: undefined },
        usage,
        warnings: [],
      },
      {
        content: [{ type: "text", text: "Added a Margherita 🍕 Delivery or pickup?" }],
        finishReason: { unified: "stop", raw: undefined },
        usage,
        warnings: [],
      },
    ],
  });
  const r0 = sent.length;
  await runAgent(RAVI, "Ravi", mock);
  assert.equal((await getSession(RAVI)).cart[0].id, "pz-margherita");
  assert.ok(since(r0).some((m) => m.to === RAVI && m.text.startsWith("Added a Margherita")));
  const firstCall: any = mock.doGenerateCalls[0];
  const toolNames = firstCall.tools.map((t: any) => t.name);
  for (const t of ["add_to_cart", "review_order", "place_order", "send_item_picker", "handover_to_human"]) assert.ok(toolNames.includes(t), t);
  const prompt = JSON.stringify(firstCall.prompt);
  assert.ok(prompt.includes("pz-margherita") && prompt.includes("one margherita pizza please") && prompt.includes("Ravi"));
  const turn = (await raw<any>("select props from events where name='agent_turn' and wa_id='919333333333'"))[0].props;
  assert.equal(turn.steps, 2);
  assert.equal(turn.input_tokens, 2400);
  assert.deepEqual(turn.tools, ["add_to_cart"]);
  ok("agent loop: tool call -> cart updated -> reply sent; prompt has menu + history; usage tracked");

  // ── lock ──
  assert.equal(await acquireLock("919222222222"), true);
  const t0 = Date.now();
  assert.equal(await acquireLock("919222222222", 1200), false);
  assert.ok(Date.now() - t0 >= 1000);
  await releaseLock("919222222222");
  assert.equal(await acquireLock("919222222222"), true);
  ok("per-customer lock serialises processing");

  // ── analytics ──
  const daily = await raw<any>("select * from v_orders_daily");
  assert.equal(daily.length, 1);
  assert.equal(Number(daily[0].orders), 2);
  assert.equal(Number(daily[0].completed), 1);
  assert.equal(Number(daily[0].lost), 1);
  assert.equal(Number(daily[0].revenue), 249 * 2 + 79 * 2); // order 1: 2 BBQ + 2 fries
  const items = await raw<any>("select * from v_item_sales");
  assert.equal(Number(items.find((i: any) => i.item_id === "pz-bbq-chicken").units), 2);
  assert.ok(!items.find((i: any) => i.item_id === "bg-veg-classic"), "cancelled order excluded from sales");
  const timing = (await raw<any>("select * from v_order_timings where order_id = 1"))[0];
  assert.ok(timing.mins_to_accepted !== null && timing.mins_to_completed !== null);
  const funnel = (await raw<any>("select * from v_funnel_daily"))[0];
  assert.equal(Number(funnel.ordered), 1); // one distinct customer, two orders
  assert.ok(Number(funnel.added_to_cart) >= 1 && Number(funnel.reached_review) >= 1);
  assert.equal(Number((await raw<any>("select * from v_customers"))[0].orders), 1);
  assert.equal((await raw<any>("select * from v_search_misses"))[0].query, "sushi");
  assert.ok((await raw<any>("select * from v_order_blockers")).length >= 1);
  assert.equal((await raw<any>("select * from v_handovers"))[0].reason, "refund request");
  assert.ok((await raw<any>("select * from v_hourly_demand")).length >= 1);
  await raw("select * from v_agent_usage_daily");
  await raw("select * from v_delivery_failures");
  ok("analytics views: revenue / items / timings / funnel / misses / blockers / handovers");

  // ── CSV export ──
  const { GET } = await import("@/app/api/admin/export/route");
  const { NextRequest } = await import("next/server");
  const res = await GET(new NextRequest("http://x/api/admin/export?dataset=orders"));
  const csv = await res.text();
  assert.ok(csv.split("\n")[0].includes("customer_name"));
  assert.equal(csv.trim().split("\n").length, 3);
  assert.equal((await GET(new NextRequest("http://x/api/admin/export?dataset=pg_shadow"))).status, 400);
  ok("CSV export works; unknown dataset rejected");

  const rls = await raw<any>("select relname from pg_class where relrowsecurity and relname in ('orders','events','messages','contacts','sessions','order_events')");
  assert.equal(rls.length, 6);
  ok("row-level security enabled on all 6 tables");

  console.log(`\n${checks} e2e checks passed`);
  await sql().end();
  await server.stop();
  await db.close();
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error("\n✘ E2E FAILED\n", e);
    process.exit(1);
  }
);
