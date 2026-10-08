/**
 * Routes webhook events: customer messages → AI agent, staff taps → order
 * state machine, delivery receipts → message log.
 */
import { q } from "@/lib/db";
import { track } from "@/lib/analytics";
import { agentConfig } from "@/data/agent";
import { restaurant } from "@/data/restaurant";
import { getItem } from "@/lib/menu";
import { menu } from "@/data/menu";
import { acquireLock, getSession, patchSession, releaseLock } from "@/lib/session";
import { runAgent } from "@/lib/agent/run";
import { activeOrders, applyAction, getOrder, orderCode, parseOrderCode, type OrderAction } from "@/lib/orders";
import { isStaff, sendStaffCard } from "@/lib/notify";
import { markReadAndType, sendText } from "@/lib/whatsapp/client";
import type { InboundMessage, StatusEvent, WebhookEvent } from "@/lib/whatsapp/webhook";

export async function handleEvents(events: WebhookEvent[]) {
  const statuses = events.filter((e): e is StatusEvent => e.kind === "status");
  const messages = events.filter((e): e is InboundMessage => e.kind === "message");

  await Promise.all(statuses.map(handleStatus));

  // Different customers in parallel; one customer's messages in order.
  const bySender = new Map<string, InboundMessage[]>();
  for (const m of messages) bySender.set(m.from, [...(bySender.get(m.from) ?? []), m]);
  await Promise.all(
    [...bySender.values()].map(async (list) => {
      for (const m of list) {
        try {
          await handleMessage(m);
        } catch (e) {
          console.error("[handler] message failed", m.id, e);
          await track("agent_error", { waId: m.from, props: { where: "handler", message: (e as Error).message.slice(0, 300) } });
          await sendText(
            m.from,
            `Sorry, something went wrong on our side 🙏 Please try again, or call us on ${restaurant.phoneDisplay}.`
          ).catch(() => {});
        }
      }
    })
  );
}

// ── Delivery receipts ─────────────────────────────────────────
const RANK: Record<string, number> = { sent: 1, delivered: 2, read: 3, failed: 4 };

async function handleStatus(s: StatusEvent) {
  await q`update messages set status = ${s.status}, error = ${s.error ?? null}, status_updated_at = now()
          where wa_message_id = ${s.id}
            and (case coalesce(status,'') when 'sent' then 1 when 'delivered' then 2 when 'read' then 3 when 'failed' then 4 else 0 end) < ${RANK[s.status] ?? 0}`;
  if (s.status === "failed") console.error(`[wa] delivery FAILED to ${s.to}: ${s.error}`);
}

// ── Rendering inbound content for the model / log ─────────────
function render(m: InboundMessage): string {
  if (m.text) return m.text;
  if (m.reply) {
    const { id, title } = m.reply;
    if (id.startsWith("item:")) {
      const it = getItem(id.slice(5));
      return `[Selected: ${it?.name ?? title} (id: ${id.slice(5)})]`;
    }
    if (id.startsWith("cat:")) {
      const c = menu.find((x) => x.id === id.slice(4));
      return `[Selected category: ${c?.label ?? title} (id: ${id.slice(4)})]`;
    }
    if (id.startsWith("more:")) {
      const [, cat, page] = id.split(":");
      return `[Tapped "More items" — show page ${page} of category ${cat}]`;
    }
    if (id === "confirm_order") return `[Tapped "Confirm order" — customer confirms the reviewed order summary]`;
    if (id === "change_order") return `[Tapped "Change" — customer wants to modify the order before confirming]`;
    if (id === "cancel_draft") return `[Tapped "Cancel" — customer wants to abandon this draft order]`;
    return `[Tapped "${title}"]`;
  }
  if (m.location) {
    const l = m.location;
    return `[Customer shared a location pin: ${l.latitude},${l.longitude}${l.name ? ` — ${l.name}` : ""}${l.address ? `, ${l.address}` : ""}]`;
  }
  if (m.media) return `[Customer sent ${m.media.type}${m.media.caption ? `: ${m.media.caption}` : ""}]`;
  return `[Unsupported message: ${m.unsupported}]`;
}

// ── One inbound message ───────────────────────────────────────
async function handleMessage(m: InboundMessage) {
  const waId = m.from;

  const [prev] = await q<{ last_inbound_at: string | null }>`select last_inbound_at from contacts where wa_id = ${waId}`;
  const gapMs = prev?.last_inbound_at ? Date.now() - new Date(prev.last_inbound_at).getTime() : Infinity;

  await q`insert into contacts (wa_id, name, last_inbound_at) values (${waId}, ${m.name ?? null}, now())
          on conflict (wa_id) do update set last_inbound_at = now(), name = coalesce(excluded.name, contacts.name)`;

  // Idempotency: Meta retries webhooks; the unique wamid makes us process once.
  const content = render(m);
  const ins = await q<{ id: string }>`insert into messages (wa_id, direction, role, wa_message_id, content)
          values (${waId}, 'in', 'user', ${m.id}, ${content}) on conflict (wa_message_id) do nothing returning id`;
  if (!ins.length) return;
  const myRowId = Number(ins[0].id);

  if (isStaff(waId)) return handleStaff(m);

  // A "chat" = first message ever, or first after 6h of silence.
  if (gapMs > 6 * 3600_000) {
    await track("session_started", { waId, props: { new_customer: !prev, via: m.reply ? "tap" : m.location ? "location" : "text" } });
  }

  // Rate limit (cost + spam protection).
  const [{ n }] = await q<{ n: string }>`select count(*) as n from messages
    where wa_id = ${waId} and direction = 'in' and created_at > now() - interval '10 minutes'`;
  const limit = agentConfig.limits.messagesPerTenMinutes;
  if (Number(n) > limit) {
    if (Number(n) === limit + 1) await track("rate_limited", { waId });
    if (Number(n) === limit + 1) await sendText(waId, "You're sending messages very fast 😅 Please give me a few minutes.");
    return;
  }

  // Human takeover active → stay quiet.
  const session = await getSession(waId);
  if (session.handover_until && new Date(session.handover_until) > new Date()) return;

  // Things the model can't read.
  if (m.media || m.unsupported) {
    const what = m.media?.type === "audio" ? "voice notes" : "that kind of message";
    await track("unsupported_message", { waId, props: { type: m.media?.type ?? m.unsupported } });
    await sendText(waId, `I can't open ${what} yet 🙈 Please type your message, tap a button, or share a location pin.`);
    return;
  }

  // Location pin → remember it for delivery.
  if (m.location) {
    const { latitude, longitude, name, address } = m.location;
    await patchSession(waId, { location: { latitude, longitude } });
    if (!session.address) {
      await patchSession(waId, {
        address: `Pin: https://maps.google.com/?q=${latitude},${longitude}${name || address ? ` (${[name, address].filter(Boolean).join(", ")})` : ""}`,
      });
    }
  }

  await markReadAndType(m.id);

  if (!(await acquireLock(waId))) {
    console.warn("[handler] could not acquire lock for", waId);
    return;
  }
  try {
    // If a newer message already arrived, its own run will answer both.
    const [{ newest }] = await q<{ newest: string }>`select coalesce(max(id),0) as newest from messages
      where wa_id = ${waId} and direction = 'in'`;
    if (Number(newest) > myRowId) return;
    await runAgent(waId, m.name);
  } finally {
    await releaseLock(waId);
  }
}

// ── Staff: tap buttons to move orders along ───────────────────
const STAFF_HELP =
  "👋 Pizza Weds Burger staff bot\n\n• Tap the buttons on order cards to update status (customers are notified automatically)\n• Send *orders* to list active orders\n• Send *resume 91XXXXXXXXXX* to un-pause the bot for a customer\n\nTip: message this number once at the start of each shift so new-order alerts keep arriving as buttons.";

async function handleStaff(m: InboundMessage) {
  const who = `staff:${m.from}`;

  if (m.reply?.id.startsWith("ord:")) {
    const [, action, idStr] = m.reply.id.split(":");
    const r = await applyAction(Number(idStr), action as OrderAction, who);
    const order = r.ok ? r.order : r.order ?? (await getOrder(Number(idStr)));
    if (!order) return void (await sendText(m.from, "Order not found."));
    const headline = r.ok
      ? `✔️ *${orderCode(order)}* → ${order.status.replace(/_/g, " ")}${action === "paid" ? " · payment recorded" : ""}`
      : `⚠️ ${r.error} — *${orderCode(order)}*`;
    await sendStaffCard(m.from, order, headline);
    return;
  }

  const text = (m.text ?? "").trim().toLowerCase();

  const resume = text.match(/^resume\s+\+?(\d{8,15})$/);
  if (resume) {
    await patchSession(resume[1], { handover_until: null });
    return void (await sendText(m.from, `Bot resumed for ${resume[1]}.`));
  }

  const code = parseOrderCode(text);
  if (code !== null) {
    const o = await getOrder(code);
    return void (o ? sendStaffCard(m.from, o) : sendText(m.from, "Order not found."));
  }

  if (text === "orders" || text === "list" || text === "/orders") {
    const list = await activeOrders();
    if (!list.length) return void (await sendText(m.from, "No active orders 🎉"));
    for (const o of list.slice(0, 8)) await sendStaffCard(m.from, o, `📋 *${orderCode(o)}*`);
    if (list.length > 8) await sendText(m.from, `…and ${list.length - 8} more (see /admin).`);
    return;
  }

  await sendText(m.from, STAFF_HELP);
}
