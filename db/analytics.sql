-- Analytics views. Query these in the Supabase SQL editor, Metabase, Looker Studio, or
-- download as CSV from /admin. Days/hours are in IST. Idempotent.
-- `security_invoker` makes views obey RLS, so the public API key can't read them.

create or replace view v_order_items with (security_invoker = true) as
select o.id as order_id, o.created_at, o.wa_id, o.order_type, o.status, o.payment_status,
       i->>'id' as item_id, i->>'name' as item_name,
       (i->>'price')::int as price, (i->>'qty')::int as qty,
       (i->>'price')::int * (i->>'qty')::int as line_total
from orders o, jsonb_array_elements(o.items) i;

-- Revenue excludes rejected/cancelled orders.
create or replace view v_orders_daily with (security_invoker = true) as
select (created_at at time zone 'Asia/Kolkata')::date as day,
       count(*)                                                        as orders,
       count(*) filter (where status = 'completed')                    as completed,
       count(*) filter (where status in ('rejected','cancelled'))      as lost,
       coalesce(sum(total) filter (where status not in ('rejected','cancelled')), 0) as revenue,
       round(avg(total) filter (where status not in ('rejected','cancelled')), 0)    as avg_order_value,
       count(*) filter (where order_type = 'delivery')                 as delivery_orders,
       count(*) filter (where order_type = 'pickup')                   as pickup_orders,
       count(*) filter (where payment_status = 'paid')                 as paid_orders
from orders group by 1 order by 1 desc;

create or replace view v_item_sales with (security_invoker = true) as
select item_id, item_name, sum(qty) as units, sum(line_total) as revenue, count(distinct order_id) as orders
from v_order_items where status not in ('rejected','cancelled')
group by 1, 2 order by units desc;

create or replace view v_hourly_demand with (security_invoker = true) as
select extract(dow  from created_at at time zone 'Asia/Kolkata')::int as day_of_week, -- 0 = Sunday
       extract(hour from created_at at time zone 'Asia/Kolkata')::int as hour,
       count(*) as orders, coalesce(sum(total), 0) as revenue
from orders where status not in ('rejected','cancelled')
group by 1, 2 order by 1, 2;

-- Minutes from order placement to each stage (kitchen speed, SLA).
create or replace view v_order_timings with (security_invoker = true) as
select o.id as order_id, o.created_at, o.order_type, o.status,
  round((extract(epoch from (min(e.created_at) filter (where e.value = 'accepted') - o.created_at)) / 60)::numeric, 1) as mins_to_accepted,
  round((extract(epoch from (min(e.created_at) filter (where e.value = 'preparing') - o.created_at)) / 60)::numeric, 1) as mins_to_preparing,
  round((extract(epoch from (min(e.created_at) filter (where e.value in ('ready','out_for_delivery')) - o.created_at)) / 60)::numeric, 1) as mins_to_ready,
  round((extract(epoch from (min(e.created_at) filter (where e.value = 'completed') - o.created_at)) / 60)::numeric, 1) as mins_to_completed
from orders o
left join order_events e on e.order_id = o.id and e.kind = 'status'
group by o.id;

-- Conversation → order funnel, one row per day (distinct customers at each step).
create or replace view v_funnel_daily with (security_invoker = true) as
select (ts at time zone 'Asia/Kolkata')::date as day,
       count(distinct wa_id) filter (where name = 'session_started')  as chats,
       count(distinct wa_id) filter (where name = 'menu_viewed')      as viewed_menu,
       count(distinct wa_id) filter (where name = 'cart_add')         as added_to_cart,
       count(distinct wa_id) filter (where name = 'order_reviewed')   as reached_review,
       count(distinct wa_id) filter (where name = 'order_placed')     as ordered
from events group by 1 order by 1 desc;

create or replace view v_customers with (security_invoker = true) as
select o.wa_id, max(o.customer_name) as name,
       count(*) filter (where o.status not in ('rejected','cancelled'))                as orders,
       coalesce(sum(o.total) filter (where o.status not in ('rejected','cancelled')), 0) as lifetime_value,
       min(o.created_at) as first_order, max(o.created_at) as last_order,
       count(*) filter (where o.status not in ('rejected','cancelled')) > 1            as is_repeat
from orders o group by o.wa_id;

-- AI cost & speed per day (tokens × your model's price = spend).
create or replace view v_agent_usage_daily with (security_invoker = true) as
select (ts at time zone 'Asia/Kolkata')::date as day,
       count(*) filter (where name = 'agent_turn')                                  as turns,
       sum((props->>'input_tokens')::int)  filter (where name = 'agent_turn')       as input_tokens,
       sum((props->>'output_tokens')::int) filter (where name = 'agent_turn')       as output_tokens,
       round(avg((props->>'latency_ms')::int) filter (where name = 'agent_turn'))   as avg_latency_ms,
       count(*) filter (where name = 'agent_error')                                 as errors
from events where name in ('agent_turn','agent_error') group by 1 order by 1 desc;

-- Things customers searched for that we don't sell → menu opportunities.
create or replace view v_search_misses with (security_invoker = true) as
select lower(props->>'query') as query, count(*) as times, max(ts) as last_seen
from events where name = 'menu_search' and (props->>'results')::int = 0
group by 1 order by times desc;

-- Why orders were blocked (closed, below minimum, …).
create or replace view v_order_blockers with (security_invoker = true) as
select p as reason, count(*) as times
from events, jsonb_array_elements_text(props->'problems') p
where name = 'order_blocked' group by 1 order by times desc;

create or replace view v_handovers with (security_invoker = true) as
select ts, wa_id, props->>'reason' as reason from events where name = 'handover' order by ts desc;

-- WhatsApp delivery problems (e.g. 131047 = outside 24h window).
create or replace view v_delivery_failures with (security_invoker = true) as
select error, count(*) as times, max(created_at) as last_seen
from messages where status = 'failed' group by 1 order by times desc;

-- Belt and braces: nothing here is for the public Data API.
revoke all on v_order_items, v_orders_daily, v_item_sales, v_hourly_demand, v_order_timings,
              v_funnel_daily, v_customers, v_agent_usage_daily, v_search_misses,
              v_order_blockers, v_handovers, v_delivery_failures from public;
