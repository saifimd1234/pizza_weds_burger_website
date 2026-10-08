# Backend Setup — where every key comes from

Brief checklist for the WhatsApp agent backend (Next.js on Vercel + Supabase + Meta Cloud API + AI Gateway).
Put values in **Vercel → Project → Settings → Environment Variables** (Production + Preview) and, for local runs, in `.env.local` (git-ignored). `.env.example` lists every variable.

> Never commit secrets. Never paste them into chat/issues. If one leaks, regenerate it at its source and redeploy.

## 1. Supabase (database) → `DATABASE_URL`

1. https://supabase.com → **New project** (pick the region closest to Vercel's, e.g. Mumbai `ap-south-1`). Save the **database password** you set.
2. Project dashboard → **Connect** button (top bar) → tab **Connection string / ORMs** → choose **Transaction pooler** → copy the URI. It looks like:
   `postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:6543/postgres`
3. Replace `[YOUR-PASSWORD]` with your database password. If the password has special characters (`@ # / :`), URL-encode them (or reset it to letters+digits: **Project Settings → Database → Reset database password**).
4. Save as `DATABASE_URL`.
   - Use the **transaction pooler (port 6543)** — right for serverless. The code already disables prepared statements for it.
   - You do **not** need the Supabase `anon` / `service_role` keys or project URL: the app talks to Postgres directly, and RLS (enabled by the schema) blocks the public API key from touching these tables. **Never add the `service_role` key to this project.**
5. Create the tables — either:
   - locally: put `DATABASE_URL` in `.env.local`, then `npm run db:migrate`; **or**
   - paste `db/schema.sql`, then `db/analytics.sql`, into **Supabase → SQL Editor → Run**.
   Re-running is safe.

## 2. Meta / WhatsApp Cloud API

Create the app first: https://developers.facebook.com → **My Apps → Create app** → use case **Other → Business** → add the **WhatsApp** product (this is Step 1 of Meta's wizard; it creates a test WABA + test number).

| Variable | Where to get it |
|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | App dashboard → **WhatsApp → API Setup** → under *Send and receive messages*, the **Phone number ID** below the "From" number. (Not the phone number itself.) |
| `WHATSAPP_ACCESS_TOKEN` | *Testing:* the **Temporary access token** on the same API Setup page (expires in ~24 h). *Production:* [business.facebook.com/settings](https://business.facebook.com/settings) → **Users → System users → Add** (Admin) → **Add assets** (your app: full control; your WhatsApp account: full control) → **Generate token** → choose your app → tick `whatsapp_business_messaging` + `whatsapp_business_management` → expiry **Never**. Copy it immediately; it's shown once. |
| `WHATSAPP_APP_SECRET` | App dashboard → **App settings → Basic → App secret → Show**. Used to verify that webhook calls really come from Meta. |
| `WHATSAPP_VERIFY_TOKEN` | You invent it. Any random string, e.g. run `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`. Paste the same value into Meta's webhook form (step 4 below). |
| `STAFF_WHATSAPP_NUMBERS` | Kitchen/owner phone numbers that receive order alerts: country code + digits, comma-separated, e.g. `918651650251,917209538634`. During testing, add each as a **recipient** under API Setup → *To* → **Manage phone number list** and verify with the code Meta sends. |
| `WHATSAPP_GRAPH_VERSION` | Optional; defaults to `v25.0`. |

Optional (only if you want order alerts to reach people outside the 24 h window): `WHATSAPP_TEMPLATE_ORDER_UPDATE`, `WHATSAPP_TEMPLATE_STAFF_ORDER`, `WHATSAPP_TEMPLATE_LANG` — the names of templates you create in **WhatsApp Manager → Message templates** (exact bodies in `docs/WHATSAPP_SETUP.md`).

**Webhook (after the first deploy):** App dashboard → **WhatsApp → Configuration → Webhook → Edit** →
- Callback URL: `https://<your-domain>/api/whatsapp/webhook`
- Verify token: your `WHATSAPP_VERIFY_TOKEN`
- **Verify and save**, then **Manage** → subscribe to **messages**.

(Later, for real customers: add your production number, billing, and business verification — Steps 2–3 of Meta's wizard; see `docs/WHATSAPP_SETUP.md`.)

## 3. AI model access → Vercel AI Gateway

- In Vercel: **AI Gateway** (team dashboard) → **API Keys → Create key** → save as `AI_GATEWAY_API_KEY` (needed locally; on Vercel deployments the project's OIDC credentials are used automatically, but setting the key is harmless).
- Local alternative: `vercel link` then `vercel env pull .env.local` (provides a short-lived OIDC token).
- `AGENT_MODEL` (optional) — any gateway id; default `anthropic/claude-haiku-5.5` (fast + cheap). Try `anthropic/claude-sonnet-5.5` if you want smarter replies.
- Gateway usage and spend appear in the Vercel dashboard; per-turn token counts are also stored in the `events` table (below).

## 4. Staff board

`ADMIN_PASSWORD` — choose a long random password. Open `https://<domain>/admin`, user `admin`. (Browser will ask via Basic auth; use HTTPS only.)

## 5. Deploy & verify

```bash
npm i -g vercel && vercel link        # once
npm run db:migrate                    # tables + analytics views
npm run selftest && npm run e2e       # local checks (no keys needed)
git push                              # auto-deploys; then set the webhook (section 2)
```
Send "Hi" from a recipient phone to the test number. Check **Vercel → Logs** if nothing arrives; the `messages` table shows `status`/`error` for every outbound message.

---

# Tracking & analysis

Everything is stored in your Supabase Postgres, so you can analyse it with SQL, Supabase's dashboard, Metabase, Looker Studio, or Excel/Sheets.

**What is recorded**

| Table | Contents |
|---|---|
| `orders` | Every order: items (JSON), totals, type, payment, status, timestamps |
| `order_events` | Each status/payment change with who did it (customer / staff number / admin) |
| `events` | Behaviour stream: `session_started`, `menu_viewed`, `item_viewed`, `menu_search` (with result count), `cart_add`, `cart_remove`, `order_reviewed`, `order_blocked` (why), `order_placed`, `handover` (why), `unsupported_message`, `rate_limited`, `agent_turn` (model, steps, tools used, tokens, latency), `agent_error` |
| `messages` | Full chat log + WhatsApp delivery status (`sent/delivered/read/failed` + error code) |
| `contacts`, `sessions` | Customer name, last contact; live cart/checkout draft |

**Ready-made views** (IST dates; run in Supabase **SQL Editor** — `select * from v_orders_daily;`)

| View | Answers |
|---|---|
| `v_orders_daily` | Orders, revenue, avg order value, delivery vs pickup, lost orders per day |
| `v_item_sales` | Best/worst sellers: units and revenue per item |
| `v_hourly_demand` | Orders by weekday × hour → staffing & prep planning |
| `v_order_timings` | Minutes from placement → accepted → preparing → ready → completed |
| `v_funnel_daily` | Chats → viewed menu → added to cart → reached review → ordered |
| `v_customers` | Repeat customers, lifetime value, last order |
| `v_search_misses` | What customers asked for that you don't sell |
| `v_order_blockers` | Why orders were blocked (closed, below minimum…) |
| `v_handovers` | Complaints/refunds/allergy escalations and reasons |
| `v_agent_usage_daily` | Turns, tokens, latency, errors → AI cost |
| `v_delivery_failures` | WhatsApp send failures by error code |

Examples:
```sql
-- Top 10 items last 30 days
select item_name, sum(qty) units, sum(line_total) revenue
from v_order_items where created_at > now() - interval '30 days' and status not in ('rejected','cancelled')
group by 1 order by units desc limit 10;

-- Funnel conversion this week
select sum(chats) chats, sum(added_to_cart) carts, sum(ordered) orders,
       round(100.0*sum(ordered)/nullif(sum(chats),0),1) as pct_chat_to_order
from v_funnel_daily where day > current_date - 7;
```

**Download as CSV:** open `/admin` → *Export for analysis* (orders, items, daily sales, funnel, customers, events, messages…).

**Dashboards:** Metabase or Looker Studio can connect with the same Postgres connection details (use the *session pooler* string from the Connect dialog for BI tools). Because Row Level Security is on, a BI tool must connect as the `postgres` user (full access, so keep that password private) — or just use the CSV export / SQL Editor, which need no extra setup.

**Privacy:** the data includes phone numbers and addresses. Keep `/admin` password strong, limit who can open the Supabase project, and delete old chats if you don't need them (`delete from messages where created_at < now() - interval '180 days';`).
