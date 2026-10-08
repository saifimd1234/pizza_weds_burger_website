import { NextRequest, NextResponse } from "next/server";
import { raw } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Whitelist: dataset name → static SQL (never interpolate user input). */
const DATASETS: Record<string, string> = {
  orders: "select * from orders order by id desc",
  order_items: "select * from v_order_items order by order_id desc",
  orders_daily: "select * from v_orders_daily",
  item_sales: "select * from v_item_sales",
  hourly_demand: "select * from v_hourly_demand",
  order_timings: "select * from v_order_timings order by order_id desc",
  funnel_daily: "select * from v_funnel_daily",
  customers: "select * from v_customers order by lifetime_value desc",
  agent_usage_daily: "select * from v_agent_usage_daily",
  search_misses: "select * from v_search_misses",
  events: "select * from events order by id desc limit 100000",
  messages: "select * from messages order by id desc limit 100000",
};

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("dataset") ?? "";
  const query = DATASETS[name];
  if (!query) {
    return NextResponse.json({ error: "Unknown dataset", available: Object.keys(DATASETS) }, { status: 400 });
  }
  const rows = await raw<Record<string, unknown>>(query);
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pwb-${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
