-- WORK IQ MVP schema: anonymous poll votes and anonymous product analytics.
-- No name, email, IP, phone, employer, or exact-age columns anywhere.

create extension if not exists pgcrypto;

-- Poll votes -----------------------------------------------------------------

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id text not null,
  option_id text not null check (option_id in ('a', 'b', 'c', 'd')),
  voter_hash text not null,
  created_at timestamptz not null default now(),
  constraint poll_votes_unique_voter unique (poll_id, voter_hash)
);

create index if not exists poll_votes_poll_idx
  on public.poll_votes (poll_id);
create index if not exists poll_votes_poll_created_idx
  on public.poll_votes (poll_id, created_at);

-- Analytics events -----------------------------------------------------------

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  anon_hash text not null,
  route text,
  category text,
  step smallint,
  question_id text,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  client_timestamp timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_time_idx
  on public.analytics_events (event, created_at);
create index if not exists analytics_events_anon_time_idx
  on public.analytics_events (anon_hash, created_at);
create index if not exists analytics_events_created_idx
  on public.analytics_events (created_at);

-- Access control -------------------------------------------------------------
-- The application only ever writes through Next.js route handlers using the
-- service-role key. Anonymous/authenticated API roles get no direct access.

alter table public.poll_votes enable row level security;
alter table public.analytics_events enable row level security;

revoke all on public.poll_votes from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;
