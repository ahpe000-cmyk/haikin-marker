-- WORK IQ MVP — analytics SQL (run in the Supabase SQL editor).
-- All queries operate on anonymous hashed device IDs only.
-- Adjust the date range placeholders as needed.

-- 1. Landing → quiz start conversion ----------------------------------------
with landings as (
  select count(distinct anon_hash) as n
  from analytics_events
  where event = 'landing_view'
    and created_at >= now() - interval '30 days'
),
starters as (
  select count(distinct anon_hash) as n
  from analytics_events
  where event in ('daily_quiz_start', 'quiz_start')
    and created_at >= now() - interval '30 days'
)
select
  landings.n as unique_landings,
  starters.n as unique_starters,
  round(100.0 * starters.n / nullif(landings.n, 0), 1) as start_rate_pct
from landings, starters;

-- 2. Quiz completion rate among starters ------------------------------------
with starts as (
  select count(distinct anon_hash) as n
  from analytics_events
  where event in ('daily_quiz_start', 'quiz_start')
    and created_at >= now() - interval '30 days'
),
completes as (
  select count(distinct anon_hash) as n
  from analytics_events
  where event = 'quiz_complete'
    and created_at >= now() - interval '30 days'
)
select
  starts.n as starters,
  completes.n as completers,
  round(100.0 * completes.n / nullif(starts.n, 0), 1) as completion_rate_pct
from starts, completes;

-- 3. Result share rate -------------------------------------------------------
with results as (
  select count(distinct anon_hash) as n
  from analytics_events
  where event = 'result_view'
    and created_at >= now() - interval '30 days'
),
shares as (
  select count(distinct anon_hash) as n
  from analytics_events
  where event = 'share_click'
    and created_at >= now() - interval '30 days'
)
select
  results.n as result_viewers,
  shares.n as sharers,
  round(100.0 * shares.n / nullif(results.n, 0), 1) as share_click_rate_pct
from results, shares;

-- 4. Poll participation ------------------------------------------------------
with views as (
  select count(distinct anon_hash) as n
  from analytics_events
  where event = 'poll_view'
    and created_at >= now() - interval '30 days'
),
votes as (
  select count(distinct anon_hash) as n
  from analytics_events
  where event = 'poll_vote'
    and created_at >= now() - interval '30 days'
)
select
  views.n as poll_viewers,
  votes.n as poll_voters,
  round(100.0 * votes.n / nullif(views.n, 0), 1) as poll_vote_rate_pct
from views, votes;

-- Poll result distribution straight from votes (per poll):
select poll_id, option_id, count(*) as votes
from poll_votes
group by poll_id, option_id
order by poll_id, option_id;

-- 5. D1 return proxy ---------------------------------------------------------
-- Users seen on a given JST day who come back the next JST day.
with daily_users as (
  select distinct
    anon_hash,
    date_trunc('day', created_at at time zone 'Asia/Tokyo') as jst_day
  from analytics_events
  where created_at >= now() - interval '30 days'
)
select
  d0.jst_day::date as day,
  count(distinct d0.anon_hash) as users,
  count(distinct d1.anon_hash) as returned_next_day,
  round(
    100.0 * count(distinct d1.anon_hash)
      / nullif(count(distinct d0.anon_hash), 0),
    1
  ) as d1_return_pct
from daily_users d0
left join daily_users d1
  on d1.anon_hash = d0.anon_hash
  and d1.jst_day = d0.jst_day + interval '1 day'
group by d0.jst_day
order by d0.jst_day;

-- 6. D7 return proxy ---------------------------------------------------------
with daily_users as (
  select distinct
    anon_hash,
    date_trunc('day', created_at at time zone 'Asia/Tokyo') as jst_day
  from analytics_events
  where created_at >= now() - interval '60 days'
)
select
  d0.jst_day::date as day,
  count(distinct d0.anon_hash) as users,
  count(distinct d7.anon_hash) as returned_day7,
  round(
    100.0 * count(distinct d7.anon_hash)
      / nullif(count(distinct d0.anon_hash), 0),
    1
  ) as d7_return_pct
from daily_users d0
left join daily_users d7
  on d7.anon_hash = d0.anon_hash
  and d7.jst_day = d0.jst_day + interval '7 days'
group by d0.jst_day
order by d0.jst_day;

-- 7. CTA click-through -------------------------------------------------------
with impressions as (
  select metadata ->> 'cta' as cta, count(*) as n
  from analytics_events
  where event = 'cta_impression'
    and created_at >= now() - interval '30 days'
  group by 1
),
clicks as (
  select metadata ->> 'cta' as cta, count(*) as n
  from analytics_events
  where event = 'cta_click'
    and created_at >= now() - interval '30 days'
  group by 1
)
select
  impressions.cta,
  impressions.n as impressions,
  coalesce(clicks.n, 0) as clicks,
  round(100.0 * coalesce(clicks.n, 0) / nullif(impressions.n, 0), 1) as ctr_pct
from impressions
left join clicks on clicks.cta = impressions.cta
order by impressions.cta;
