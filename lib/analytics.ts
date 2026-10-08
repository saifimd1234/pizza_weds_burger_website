/**
 * Product-analytics event stream → `events` table (see db/analytics.sql for views).
 * Never throws: tracking must not be able to break an order.
 *
 * Event names: session_started, menu_viewed, item_viewed, menu_search, cart_add,
 * cart_remove, order_reviewed, order_blocked, order_placed, handover,
 * unsupported_message, rate_limited, agent_turn, agent_error.
 */
import { json, q } from "@/lib/db";

export type TrackOpts = { waId?: string; orderId?: number; props?: Record<string, unknown> };

export async function track(name: string, o: TrackOpts = {}) {
  try {
    await q`insert into events (name, wa_id, order_id, props)
            values (${name}, ${o.waId ?? null}, ${o.orderId ?? null}, ${json(o.props ?? {})})`;
  } catch (e) {
    console.warn("[analytics] track failed:", name, (e as Error).message);
  }
}
