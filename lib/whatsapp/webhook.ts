/**
 * Webhook helpers: signature check + payload normalisation.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/** Verifies `X-Hub-Signature-256: sha256=<hmac of RAW body with App Secret>`. */
export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const given = header.slice("sha256=".length);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(given, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// ── Normalised events ─────────────────────────────────────────
export type InboundMessage = {
  kind: "message";
  id: string; // wamid
  from: string; // wa_id
  name?: string;
  timestamp: number;
  /** What the agent/handler sees. */
  text?: string;
  /** Set for tapped buttons / list rows / template quick replies. */
  reply?: { id: string; title: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  media?: { type: "image" | "audio" | "video" | "document" | "sticker"; id: string; caption?: string };
  unsupported?: string;
};

export type StatusEvent = {
  kind: "status";
  id: string; // wamid of OUR message
  to: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: number;
  error?: string;
};

export type WebhookEvent = InboundMessage | StatusEvent;

export function parseWebhook(body: any): WebhookEvent[] {
  const out: WebhookEvent[] = [];
  if (body?.object !== "whatsapp_business_account") return out;
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const v = change.value ?? {};
      const names: Record<string, string> = {};
      for (const c of v.contacts ?? []) names[c.wa_id] = c.profile?.name;

      for (const m of v.messages ?? []) {
        const base = {
          kind: "message" as const,
          id: m.id as string,
          from: m.from as string,
          name: names[m.from],
          timestamp: Number(m.timestamp),
        };
        switch (m.type) {
          case "text":
            out.push({ ...base, text: m.text?.body });
            break;
          case "interactive": {
            const r = m.interactive?.button_reply ?? m.interactive?.list_reply;
            if (r) out.push({ ...base, reply: { id: r.id, title: r.title } });
            else out.push({ ...base, unsupported: "interactive" });
            break;
          }
          case "button": // template quick-reply tap
            out.push({
              ...base,
              reply: { id: m.button?.payload ?? m.button?.text, title: m.button?.text ?? "" },
            });
            break;
          case "location":
            out.push({
              ...base,
              location: {
                latitude: m.location.latitude,
                longitude: m.location.longitude,
                name: m.location.name,
                address: m.location.address,
              },
            });
            break;
          case "image":
          case "audio":
          case "video":
          case "document":
          case "sticker":
            out.push({
              ...base,
              media: { type: m.type, id: m[m.type]?.id, caption: m[m.type]?.caption },
            });
            break;
          default:
            out.push({ ...base, unsupported: m.type });
        }
      }

      for (const s of v.statuses ?? []) {
        out.push({
          kind: "status",
          id: s.id,
          to: s.recipient_id,
          status: s.status,
          timestamp: Number(s.timestamp),
          error: s.errors?.[0]
            ? `${s.errors[0].code}: ${s.errors[0].title ?? s.errors[0].message ?? ""}`
            : undefined,
        });
      }
    }
  }
  return out;
}
