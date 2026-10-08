# WhatsApp AI Agent — Setup Guide

Matches the three steps in Meta's "Get started" wizard. Code is already in this repo; you only need to create the Meta assets, provision a database, set env vars and deploy.

## How it works

```
Customer ──WhatsApp──▶ Meta Cloud API ──POST /api/whatsapp/webhook──▶ Next.js (Vercel)
                                              │  verify X-Hub-Signature-256, ACK 200 fast
                                              ▼  after():
                                   dedupe → rate-limit → per-customer lock
                                              ▼
                                   AI agent (AI SDK ToolLoopAgent, via AI Gateway)
                                   tools: menu, cart, checkout, review, place_order,
                                          order status, cancel, handover
                                              ▼
                       Supabase Postgres (sessions, messages, orders, order_events, events)
                                              ▼
 Kitchen staff ◀── WhatsApp buttons / template ──┤── /admin board (Basic auth)
      │ tap Accept / Preparing / Out for delivery / Delivered / Payment received
      ▼
 applyAction() → updates DB → tells the customer automatically
```

Order lifecycle: `placed → accepted → preparing → ready (pickup) | out_for_delivery (delivery) → completed`, with `rejected` / `cancelled` exits. Payment is tracked separately (`pending → paid`).

## Step 1 — "Try it out" (test number, ~5 min)

1. https://developers.facebook.com → **Create app** → type **Business** → add the **WhatsApp** product. Meta creates a *test WABA* and a *test number* for you.
2. **WhatsApp → API Setup**: note the **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
   Add up to 5 **recipient numbers** (your phone + staff phones) and verify them with the code.
3. **App settings → Basic**: copy **App secret** → `WHATSAPP_APP_SECRET`.
4. The 24h temporary token on that page is fine for a first smoke test (`WHATSAPP_ACCESS_TOKEN`) but expires. Replace it in Step 2 with a System User token.

## Provision infra & keys (once)

Everything — Supabase `DATABASE_URL`, the Meta values, AI Gateway key, admin password — and exactly where to find each is in **[docs/BACKEND_SETUP.md](BACKEND_SETUP.md)**. In short:

```bash
npm i -g vercel && vercel link
# put DATABASE_URL (Supabase transaction pooler) in .env.local, then:
npm run db:migrate           # tables + analytics views
npm run selftest && npm run e2e
```
Add the env vars in Vercel (`.env.example` is the checklist) and deploy (`git push` auto-deploys).

## Connect the webhook

Meta dashboard → **WhatsApp → Configuration → Webhook**:

- **Callback URL:** `https://<your-domain>/api/whatsapp/webhook`
- **Verify token:** the same string as `WHATSAPP_VERIFY_TOKEN`
- Click **Verify and save**, then **Manage** → subscribe to **`messages`**.

Smoke test: from a verified recipient phone, message the test number "Hi". Staff phones should also message the bot once ("hi") so order alerts arrive as tap buttons (see *24-hour window* below).

## Step 2 — Production setup (~20 min)

1. **Business portfolio** (business.facebook.com) — create/choose the restaurant's.
2. **Add a real phone number** (WhatsApp → API Setup → Add phone number). Use a number that is **not** currently used in the normal WhatsApp / WhatsApp Business app, or it will be disconnected there. Verify via SMS/call.
3. **System User token (permanent):** Business settings → Users → **System users** → Add (Admin) → **Add assets**: your app + the WhatsApp account (full control) → **Generate token** with `whatsapp_business_messaging` and `whatsapp_business_management`, no expiry. Put it in `WHATSAPP_ACCESS_TOKEN` and redeploy.
4. **Payment method:** Business settings → Billing → add a card to the WABA (needed beyond free tier / for templates and marketing).
5. **Display name & profile:** set "Pizza Weds Burger", photo, description, address, hours.
6. Update `WHATSAPP_PHONE_NUMBER_ID` to the production number's ID. The webhook is app-level, so it stays.

## Step 3 — Business verification

Upload registration documents (GST / Udyam / shop licence, utility bill, FSSAI) in Business settings → Security centre → **Start verification**. It lifts messaging limits and is needed for some features. You can run in production before it completes (starting limit is low).

## Templates (only needed outside the 24-hour window)

WhatsApp allows free-form messages only within **24h of the recipient's last message to you**.

- **Customers:** order updates almost always arrive inside 24h of their order chat, so no template is normally needed.
- **Staff:** a staff member who hasn't messaged the bot in 24h can't receive free-form buttons. Either have each staff member send "hi" at the start of a shift, **or** create these templates (WhatsApp Manager → Message templates, category **Utility**, language `en`) and set the env vars. Approval usually takes minutes to hours.

`WHATSAPP_TEMPLATE_ORDER_UPDATE` — body: `Update on order {{1}}: {{2}}`

`WHATSAPP_TEMPLATE_STAFF_ORDER` — body: `🔔 New order {{1}}: {{2}} — ₹{{3}} ({{4}}) for {{5}}` with **two Quick Reply buttons**: `Accept` and `Reject`. (The code attaches the payloads `ord:accept:<id>` / `ord:reject:<id>`.)

The `/admin` board always works as a fallback.

## Operating it

- **Kitchen board:** `https://<domain>/admin` (user `admin`).
- **Staff on WhatsApp:** tap buttons on order cards; send `orders` to list active ones; `PWB1004` to open one; `resume 91XXXXXXXXXX` to un-pause the bot after a human handover.
- **Handover:** complaints/refunds/allergies/bulk orders alert staff with the customer's `wa.me` link and pause the bot for 2 h. Reply to the customer from a phone (the API number can't also be used in the WhatsApp app).
- **Delivery receipts:** `messages.status` is updated from Meta status webhooks (`sent/delivered/read/failed`, with error code) — query it to debug missed messages.

## Changing business rules

- Menu/prices: `data/menu.ts` (the agent reads it — one source for site and bot).
- Hours, delivery fee, minimum order, ETAs, limits: `data/agent.ts`.
- Brand/contact/address: `data/restaurant.ts`.
- Personality & flow: `lib/agent/prompt.ts`. Tools & guardrails: `lib/agent/tools.ts`.

## Adding online payment later (UPI / cards)

Payment is already modelled (`payment_status`, `payment_method='online'`, `applyAction(id,'paid',…)` which confirms to the customer). To add Razorpay: add a `create_payment_link` tool (Razorpay Payment Links API, `reference_id = order id`), allow `online` in `agentConfig.paymentMethods`, and add `/api/razorpay/webhook` that verifies `X-Razorpay-Signature` and calls `applyAction(orderId, 'paid', 'razorpay')` on `payment_link.paid`.

## Known limits / next upgrades

- Voice notes and images get a polite "please type" reply (no transcription yet).
- Delivery radius is advisory (text + optional pin); staff can reject out-of-area orders.
- For a richer browse UX, connect a Meta **Commerce catalog** and use Multi-Product Messages.
