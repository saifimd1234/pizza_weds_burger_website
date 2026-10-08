/**
 * ──────────────────────────────────────────────────────────────
 *  WHATSAPP AGENT CONFIG  (business rules the bot enforces)
 * ──────────────────────────────────────────────────────────────
 *  Brand / contact / address live in data/restaurant.ts. This file
 *  holds ordering rules. Prices come from data/menu.ts — the agent
 *  never invents or trusts a price from the model.
 */

export const agentConfig = {
  /** Timezone used for "are we open?" checks. */
  timezone: "Asia/Kolkata",

  /**
   * Opening hours as numbers so the bot can compute "open now".
   * Keep in sync with `restaurant.hours`. A close time past midnight
   * (e.g. 25 = 1:00 AM next day) is allowed. Day 0 = Sunday.
   */
  hours: {
    0: { open: 12, close: 23 }, // Sunday
    1: { open: 11, close: 23 },
    2: { open: 11, close: 23 },
    3: { open: 11, close: 23 },
    4: { open: 11, close: 23 },
    5: { open: 11, close: 25 }, // Friday
    6: { open: 11, close: 25 }, // Saturday
  } as Record<number, { open: number; close: number }>,

  /** Stop taking orders this many minutes before closing. */
  lastOrderBeforeCloseMins: 20,

  /** Order types the bot offers. */
  orderTypes: ["delivery", "pickup"] as const,

  delivery: {
    fee: 30, // ₹
    freeAbove: 499, // free delivery when subtotal >= this
    minOrder: 149, // ₹ minimum subtotal for delivery
    areaNote: "We deliver within ~5 km of Sakchi, Jamshedpur.",
  },

  /** Rough kitchen time shown to customers (minutes). */
  etaMinutes: { pickup: "15-20", delivery: "30-40" },

  /** Payment methods the bot can offer. Add "online" when a gateway is wired. */
  paymentMethods: ["cod", "pay_at_pickup"] as const,

  /** Safety caps. */
  limits: {
    maxQtyPerItem: 20,
    maxItemsPerOrder: 40,
    maxOrderValue: 10000, // above this → hand over to a human
    messagesPerTenMinutes: 40, // per-customer rate limit
    historyMessages: 24, // chat turns given to the model
    handoverHours: 2, // bot stays quiet this long after a handover
  },
} as const;

export type OrderType = (typeof agentConfig.orderTypes)[number];
export type PaymentMethod = (typeof agentConfig.paymentMethods)[number];
