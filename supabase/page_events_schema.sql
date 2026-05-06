create extension if not exists "pgcrypto";

create table if not exists public.page_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (length(trim(event_name)) > 0),
  path text,
  session_id text,
  attempt_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

alter table public.page_events
add column if not exists user_agent text;

alter table public.page_events
add column if not exists referrer text;

alter table public.page_events
add column if not exists utm_source text;

alter table public.page_events
add column if not exists utm_medium text;

alter table public.page_events
add column if not exists utm_campaign text;

alter table public.page_events enable row level security;

revoke all on public.page_events from anon, authenticated;

grant usage on schema public to anon;
grant insert on public.page_events to anon;

drop policy if exists "Allow anonymous insert page events" on public.page_events;
create policy "Allow anonymous insert page events"
on public.page_events
for insert
to anon
with check (
  event_name is not null
  and length(trim(event_name)) > 0
  and metadata is not null
);

create index if not exists idx_page_events_created_at
on public.page_events (created_at);

create index if not exists idx_page_events_event_name
on public.page_events (event_name);

create index if not exists idx_page_events_session_id
on public.page_events (session_id);

create index if not exists idx_page_events_attempt_id
on public.page_events (attempt_id);

create index if not exists idx_page_events_utm_source
on public.page_events (utm_source);

create index if not exists idx_page_events_utm_campaign
on public.page_events (utm_campaign);
