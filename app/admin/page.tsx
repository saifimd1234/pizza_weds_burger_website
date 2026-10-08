"use client";

import { useCallback, useEffect, useState } from "react";

type Item = { id: string; name: string; qty: number; note?: string };
type Order = {
  id: number;
  wa_id: string;
  customer_name: string;
  order_type: "delivery" | "pickup";
  address: string | null;
  notes: string | null;
  items: Item[];
  total: number;
  payment_method: string;
  payment_status: "pending" | "paid" | "refunded";
  status: string;
  created_at: string;
};

const code = (o: Order) => `PWB${1000 + o.id}`;

const NEXT: Record<string, (o: Order) => { action: string; label: string }[]> = {
  placed: () => [
    { action: "accept", label: "Accept" },
    { action: "reject", label: "Reject" },
  ],
  accepted: () => [
    { action: "prepare", label: "Start preparing" },
    { action: "cancel", label: "Cancel" },
  ],
  preparing: (o) => [
    o.order_type === "delivery"
      ? { action: "dispatch", label: "Out for delivery" }
      : { action: "ready", label: "Ready for pickup" },
    { action: "cancel", label: "Cancel" },
  ],
  ready: () => [{ action: "complete", label: "Picked up" }],
  out_for_delivery: () => [{ action: "complete", label: "Delivered" }],
};

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`;
};

export default function AdminPage() {
  const [data, setData] = useState<{ active: Order[]; recent: Order[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/orders", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData(await r.json());
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  async function act(o: Order, action: string) {
    setBusy(`${o.id}:${action}`);
    const r = await fetch(`/api/admin/orders/${o.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!r.ok) setErr((await r.json().catch(() => ({}))).error ?? "Action failed");
    setBusy(null);
    load();
  }

  const btn =
    "rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold hover:border-flame hover:text-flame disabled:opacity-50";

  const Card = ({ o }: { o: Order }) => (
    <li className="rounded-2xl border border-white/10 bg-night/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-display text-lg uppercase">{code(o)}</div>
        <div className="text-xs text-cream/60">{ago(o.created_at)}</div>
      </div>
      <div className="mt-1 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-flame/20 px-2 py-0.5 text-flame">{o.status.replace(/_/g, " ")}</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5">{o.order_type}</span>
        <span className={`rounded-full px-2 py-0.5 ${o.payment_status === "paid" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-200"}`}>
          {o.payment_status === "paid" ? "paid" : `${o.payment_method === "cod" ? "COD" : "pay at pickup"} · ₹${o.total} due`}
        </span>
      </div>
      <ul className="mt-3 space-y-0.5 text-sm">
        {o.items.map((i) => (
          <li key={i.id + (i.note ?? "")}>
            {i.qty} × {i.name}
            {i.note ? <span className="text-cream/50"> ({i.note})</span> : null}
          </li>
        ))}
      </ul>
      <div className="mt-2 text-sm font-semibold">Total ₹{o.total}</div>
      <div className="mt-2 text-xs text-cream/60">
        👤 {o.customer_name} ·{" "}
        <a className="underline" href={`https://wa.me/${o.wa_id}`} target="_blank">
          +{o.wa_id}
        </a>
        {o.address ? <div className="mt-0.5">📍 {o.address}</div> : null}
        {o.notes ? <div className="mt-0.5">📝 {o.notes}</div> : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(NEXT[o.status]?.(o) ?? []).map((b) => (
          <button key={b.action} className={btn} disabled={busy !== null} onClick={() => act(o, b.action)}>
            {b.label}
          </button>
        ))}
        {o.payment_status === "pending" && !["rejected", "cancelled"].includes(o.status) && (
          <button className={btn} disabled={busy !== null} onClick={() => act(o, "paid")}>
            💰 Payment received
          </button>
        )}
      </div>
    </li>
  );

  return (
    <main className="min-h-screen bg-charcoal px-4 py-8 text-cream">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl uppercase">Kitchen board</h1>
          <button className={btn} onClick={load}>
            Refresh
          </button>
        </div>
        {err && <p className="mt-3 rounded-lg bg-red-500/20 p-3 text-sm text-red-200">{err}</p>}

        <h2 className="mt-8 font-display text-xl uppercase text-flame">
          Active ({data?.active.length ?? "…"})
        </h2>
        {data && data.active.length === 0 && <p className="mt-2 text-sm text-cream/60">No active orders.</p>}
        <ul className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.active.map((o) => <Card key={o.id} o={o} />)}
        </ul>

        <h2 className="mt-10 font-display text-xl uppercase text-cream/70">Recent</h2>
        <ul className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.recent.map((o) => <Card key={o.id} o={o} />)}
        </ul>

        <h2 className="mt-10 font-display text-xl uppercase text-cream/70">Export for analysis (CSV)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "orders",
            "order_items",
            "orders_daily",
            "item_sales",
            "hourly_demand",
            "order_timings",
            "funnel_daily",
            "customers",
            "agent_usage_daily",
            "search_misses",
            "events",
            "messages",
          ].map((d) => (
            <a key={d} className={btn} href={`/api/admin/export?dataset=${d}`}>
              {d.replace(/_/g, " ")}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
