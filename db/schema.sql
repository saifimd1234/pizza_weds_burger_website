-- Pizza Weds Burger — WhatsApp agent schema (Supabase Postgres).
-- Idempotent: safe to run repeatedly (`npm run db:migrate`).

create table if not exists contacts (
  wa_id            text primary key,
  name             text,
  last_inbound_at  timestamptz,           -- drives the 24h customer-service window
  created_at       timestamptz not null default now()
);

-- One row per customer: cart + checkout draft + concurrency lock.
create table if not exists sessions (
  wa_id                text primary key,
  cart                 jsonb not null default '[]'::jsonb,   -- [{id, qty, note?}]
  order_type           text,
  address              text,
  location             jsonb,                                -- {latitude, longitude}
  customer_name        text,
  payment_method       text,
  review_hash          text,        -- cart hash the customer was shown; place_order requires a match
  handover_until       timestamptz, -- bot silent until this time (human takeover)
  lock_until           timestamptz, -- per-customer processing lease
  updated_at           timestamptz not null default now()
);

-- Conversation log (both directions) + delivery status of outbound messages.
create table if not exists messages (
  id                 bigserial primary key,
  wa_id              text not null,
  direction          text not null check (direction in ('in','out')),
  role               text not null check (role in ('user','assistant')),
  wa_message_id      text unique,        -- inbound dedupe + outbound status matching
  content            text not null,
  status             text,               -- sent | delivered | read | failed
  error              text,
  created_at         timestamptz not null default now(),
  status_updated_at  timestamptz
);
create index if not exists messages_wa_idx on messages (wa_id, id desc);

create table if not exists orders (
  id               serial primary key,   -- int4 on purpose: always a JS number
  wa_id            text not null,
  customer_name    text not null,
  order_type       text not null check (order_type in ('delivery','pickup')),
  address          text,
  location         jsonb,
  notes            text,
  items            jsonb not null,          -- [{id,name,price,qty,note?}]
  subtotal         integer not null,
  delivery_fee     integer not null default 0,
  total            integer not null,
  payment_method   text not null check (payment_method in ('cod','pay_at_pickup','online')),
  payment_status   text not null default 'pending' check (payment_status in ('pending','paid','refunded')),
  payment_ref      text,
  paid_at          timestamptz,
  status           text not null default 'placed'
                     check (status in ('placed','accepted','preparing','ready','out_for_delivery','completed','rejected','cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists orders_status_idx on orders (status, created_at desc);
create index if not exists orders_wa_idx on orders (wa_id, created_at desc);

-- Every status/payment change, with who did it → timings & audit trail.
create table if not exists order_events (
  id          bigserial primary key,
  order_id    integer not null references orders(id) on delete cascade,
  kind        text not null,            -- status | payment
  value       text not null,
  actor       text not null,            -- customer | staff:<number> | admin | system
  created_at  timestamptz not null default now()
);
create index if not exists order_events_idx on order_events (order_id, id);

-- Product-analytics event stream (funnel, search misses, AI cost, handovers…).
create table if not exists events (
  id        bigserial primary key,
  ts        timestamptz not null default now(),
  name      text not null,
  wa_id     text,
  order_id  integer,
  props     jsonb not null default '{}'::jsonb
);
create index if not exists events_name_ts_idx on events (name, ts desc);
create index if not exists events_wa_idx on events (wa_id, ts desc);

-- SECURITY: Supabase exposes the public schema through its Data API. These tables hold
-- phone numbers and addresses, so lock them for the public/anon key. With RLS on and no
-- policies, only the server's direct Postgres connection (role `postgres`) can read them.
alter table contacts     enable row level security;
alter table sessions     enable row level security;
alter table messages     enable row level security;
alter table orders       enable row level security;
alter table order_events enable row level security;
alter table events       enable row level security;
