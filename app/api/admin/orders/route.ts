import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { ACTIVE_STATUSES, type Order } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const active = await q<Order>`select * from orders where status = any(${ACTIVE_STATUSES}) order by id asc`;
  const recent = await q<Order>`select * from orders where not (status = any(${ACTIVE_STATUSES})) order by id desc limit 15`;
  return NextResponse.json({ active, recent });
}
