/**
 * WhatsApp Cloud API client — every outbound message goes through here so
 * limits are enforced in one place and each send is logged (→ delivery status
 * webhooks can later be matched to the wamid).
 */
import { q } from "@/lib/db";

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v25.0";

export const clip = (s: string, n: number) =>
  s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";

function cfg() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    throw new Error("WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set");
  }
  return { token, phoneId };
}

export class WhatsAppError extends Error {
  constructor(
    message: string,
    public code?: number,
    public status?: number
  ) {
    super(message);
  }
}

async function graph(path: string, body: unknown): Promise<any> {
  const { token } = cfg();
  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = json?.error;
    throw new WhatsAppError(
      e?.error_data?.details || e?.message || `HTTP ${res.status}`,
      e?.code,
      res.status
    );
  }
  return json;
}

/** Remember what we sent so the model has context next turn + statuses can attach. */
async function logOutbound(to: string, wamid: string | undefined, summary: string) {
  try {
    await q`insert into messages (wa_id, direction, role, wa_message_id, content, status)
            values (${to}, 'out', 'assistant', ${wamid ?? null}, ${summary}, 'sent')
            on conflict (wa_message_id) do nothing`;
  } catch (e) {
    console.error("[wa] logOutbound failed", e);
  }
}

async function send(to: string, type: string, payload: object, summary: string) {
  const { phoneId } = cfg();
  const json = await graph(`${phoneId}/messages`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type,
    [type]: payload,
  });
  const wamid: string | undefined = json?.messages?.[0]?.id;
  await logOutbound(to, wamid, summary);
  return wamid;
}

// ── Plain text ────────────────────────────────────────────────
export function sendText(to: string, body: string, previewUrl = false) {
  const text = clip(body, 4000);
  return send(to, "text", { body: text, preview_url: previewUrl }, text);
}

// ── Reply buttons (max 3, title ≤ 20 chars) ───────────────────
export type Button = { id: string; title: string };

export function sendButtons(
  to: string,
  body: string,
  buttons: Button[],
  opts: { header?: string; footer?: string } = {}
) {
  const interactive: any = {
    type: "button",
    body: { text: clip(body, 1024) },
    action: {
      buttons: buttons.slice(0, 3).map((b) => ({
        type: "reply",
        reply: { id: b.id.slice(0, 256), title: clip(b.title, 20) },
      })),
    },
  };
  if (opts.header) interactive.header = { type: "text", text: clip(opts.header, 60) };
  if (opts.footer) interactive.footer = { text: clip(opts.footer, 60) };
  return send(to, "interactive", interactive, `[buttons] ${body}`);
}

// ── List (max 10 rows total, title ≤ 24, description ≤ 72) ────
export type ListRow = { id: string; title: string; description?: string };
export type ListSection = { title: string; rows: ListRow[] };

export function sendList(
  to: string,
  body: string,
  buttonLabel: string,
  sections: ListSection[],
  opts: { header?: string; footer?: string } = {}
) {
  let budget = 10;
  const trimmed = sections
    .map((s) => {
      const rows = s.rows.slice(0, Math.max(0, budget)).map((r) => ({
        id: r.id.slice(0, 200),
        title: clip(r.title, 24),
        ...(r.description ? { description: clip(r.description, 72) } : {}),
      }));
      budget -= rows.length;
      return { title: clip(s.title, 24), rows };
    })
    .filter((s) => s.rows.length > 0);
  const interactive: any = {
    type: "list",
    body: { text: clip(body, 1024) },
    action: { button: clip(buttonLabel, 20), sections: trimmed },
  };
  if (opts.header) interactive.header = { type: "text", text: clip(opts.header, 60) };
  if (opts.footer) interactive.footer = { text: clip(opts.footer, 60) };
  return send(to, "interactive", interactive, `[list] ${body}`);
}

// ── Media ─────────────────────────────────────────────────────
export function sendImage(to: string, link: string, caption?: string) {
  return send(
    to,
    "image",
    { link, ...(caption ? { caption: clip(caption, 1000) } : {}) },
    `[image] ${caption ?? link}`
  );
}

// ── CTA URL button (e.g. “Open Google Maps”) ──────────────────
export function sendCtaUrl(to: string, body: string, label: string, url: string) {
  return send(
    to,
    "interactive",
    {
      type: "cta_url",
      body: { text: clip(body, 1024) },
      action: { name: "cta_url", parameters: { display_text: clip(label, 20), url } },
    },
    `[link] ${body} ${url}`
  );
}

// ── Location ──────────────────────────────────────────────────
export function sendLocation(
  to: string,
  lat: number,
  lng: number,
  name: string,
  address: string
) {
  return send(
    to,
    "location",
    { latitude: String(lat), longitude: String(lng), name, address },
    `[location] ${name}`
  );
}

/** Shows WhatsApp's native “Send location” button. */
export function sendLocationRequest(to: string, body: string) {
  return send(
    to,
    "interactive",
    {
      type: "location_request_message",
      body: { text: clip(body, 1024) },
      action: { name: "send_location" },
    },
    `[location request] ${body}`
  );
}

// ── Template (needed outside the 24h window) ──────────────────
export function sendTemplate(
  to: string,
  name: string,
  language: string,
  bodyParams: string[],
  quickReplyPayloads: string[] = []
) {
  const components: any[] = [];
  if (bodyParams.length) {
    components.push({
      type: "body",
      parameters: bodyParams.map((t) => ({ type: "text", text: clip(t, 900) })),
    });
  }
  quickReplyPayloads.forEach((payload, index) =>
    components.push({
      type: "button",
      sub_type: "quick_reply",
      index: String(index),
      parameters: [{ type: "payload", payload }],
    })
  );
  return send(
    to,
    "template",
    { name, language: { code: language }, components },
    `[template ${name}] ${bodyParams.join(" | ")}`
  );
}

// ── Read receipt + typing indicator (lasts ≤25s or until we reply) ──
export async function markReadAndType(messageId: string) {
  try {
    const { phoneId } = cfg();
    await graph(`${phoneId}/messages`, {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
      typing_indicator: { type: "text" },
    });
  } catch (e) {
    console.warn("[wa] markReadAndType failed", (e as Error).message);
  }
}
