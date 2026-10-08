import { NextRequest, NextResponse } from "next/server";
import { applyAction, type OrderAction } from "@/lib/orders";

export const dynamic = "force-dynamic";

const ACTIONS: OrderAction[] = ["accept", "reject", "prepare", "ready", "dispatch", "complete", "cancel", "paid"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action } = (await req.json().catch(() => ({}))) as { action?: OrderAction };
  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  }
  const r = await applyAction(Number(id), action, "admin");
  return NextResponse.json(r, { status: r.ok ? 200 : 409 });
}
