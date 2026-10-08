import { NextRequest, NextResponse, after } from "next/server";
import { handleEvents } from "@/lib/handler";
import { parseWebhook, verifySignature } from "@/lib/whatsapp/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The AI turn runs after the 200 is returned; give it room.
export const maxDuration = 120;

/** Meta's one-time subscription handshake. */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (
    p.get("hub.mode") === "subscribe" &&
    process.env.WHATSAPP_VERIFY_TOKEN &&
    p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/** Events: messages + delivery statuses. Must ACK fast; work happens in after(). */
export async function POST(req: NextRequest) {
  const raw = await req.text(); // signature is over the RAW body
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let events;
  try {
    events = parseWebhook(JSON.parse(raw));
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }

  if (events.length) {
    after(async () => {
      try {
        await handleEvents(events);
      } catch (e) {
        console.error("[webhook] handleEvents crashed", e);
      }
    });
  }
  return NextResponse.json({ ok: true });
}
