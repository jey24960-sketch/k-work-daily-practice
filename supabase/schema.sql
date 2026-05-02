create extension if not exists "pgcrypto";

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  total_score integer not null check (total_score >= 0 and total_score <= 20),
  total_questions integer not null default 20 check (total_questions > 0 and total_questions <= 100),
  vocabulary_score integer check (vocabulary_score is null or vocabulary_score >= 0),
  grammar_score integer check (grammar_score is null or grammar_score >= 0),
  reading_score integer check (reading_score is null or reading_score >= 0),
  workplace_score integer check (workplace_score is null or workplace_score >= 0),
  weakest_sections text[],
  target_industry text check (
    target_industry is null or target_industry in (
      'Manufacturing',
      'Agriculture/Livestock',
      'Construction',
      'Service',
      'Fishery',
      'Other'
    )
  ),
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create table if not exists public.opt_in_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  contact text not null check (length(trim(contact)) > 0),
  contact_type text check (
    contact_type is null or contact_type in ('email', 'phone_or_whatsapp', 'other')
  ),
  target_industry text check (
    target_industry is null or target_industry in (
      'Manufacturing',
      'Agriculture/Livestock',
      'Construction',
      'Service',
      'Fishery',
      'Other'
    )
  ),
  total_score integer check (total_score is null or (total_score >= 0 and total_score <= 20)),
  consent boolean not null default true check (consent = true),
  source text not null default 'result_page_opt_in' check (source = 'result_page_opt_in'),
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create table if not exists public.share_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  attempt_id uuid,
  total_score integer check (total_score is null or (total_score >= 0 and total_score <= 20)),
  channel text check (
    channel is null or channel in ('web_share', 'whatsapp', 'copy_link', 'facebook')
  ),
  utm_source text,
  utm_medium text,
  utm_campaign text
);

alter table public.test_attempts enable row level security;
alter table public.opt_in_leads enable row level security;
alter table public.share_events enable row level security;

revoke all on public.test_attempts from anon, authenticated;
revoke all on public.opt_in_leads from anon, authenticated;
revoke all on public.share_events from anon, authenticated;

grant usage on schema public to anon;
grant insert on public.test_attempts to anon;
grant insert on public.opt_in_leads to anon;
grant insert on public.share_events to anon;

drop policy if exists "Allow anonymous insert test attempts" on public.test_attempts;
create policy "Allow anonymous insert test attempts"
on public.test_attempts
for insert
to anon
with check (true);

drop policy if exists "Allow anonymous insert opt in leads" on public.opt_in_leads;
create policy "Allow anonymous insert opt in leads"
on public.opt_in_leads
for insert
to anon
with check (
  contact is not null
  and length(trim(contact)) > 0
  and consent = true
  and source = 'result_page_opt_in'
);

drop policy if exists "Allow anonymous insert share events" on public.share_events;
create policy "Allow anonymous insert share events"
on public.share_events
for insert
to anon
with check (true);

create index if not exists idx_test_attempts_created_at
on public.test_attempts (created_at desc);

create index if not exists idx_test_attempts_utm_source
on public.test_attempts (utm_source);

create index if not exists idx_test_attempts_utm_campaign
on public.test_attempts (utm_campaign);

create index if not exists idx_opt_in_leads_created_at
on public.opt_in_leads (created_at desc);

create index if not exists idx_opt_in_leads_utm_source
on public.opt_in_leads (utm_source);

create index if not exists idx_share_events_created_at
on public.share_events (created_at desc);

create index if not exists idx_share_events_attempt_id
on public.share_events (attempt_id);

create index if not exists idx_share_events_channel
on public.share_events (channel);
