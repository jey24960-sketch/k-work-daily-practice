# Analytics Export For First 100 Users

K-Work Daily Practice uses lightweight Supabase event rows for public-test analysis. There is no dashboard in the app. Export query results from Supabase Table Editor or SQL Editor, then paste the summarized numbers into ChatGPT.

`public.page_events` stores anonymous funnel events only. It should not contain names, emails, phone numbers, WhatsApp numbers, or opt-in contact values. Actual voluntary contact stays only in `public.opt_in_leads`.

## Funnel Counts

```sql
select
  event_name,
  count(*) as events
from public.page_events
where event_name in (
  'landing_viewed',
  'test_intro_viewed',
  'test_started',
  'test_submitted',
  'result_viewed',
  'share_clicked',
  'opt_in_submitted',
  'retake_clicked'
)
group by event_name
order by event_name;
```

## Unique Sessions Per Event

```sql
select
  event_name,
  count(distinct session_id) as sessions
from public.page_events
where session_id is not null
group by event_name
order by event_name;
```

## UTM Campaign Performance

```sql
select
  coalesce(utm_source, '(none)') as utm_source,
  coalesce(utm_medium, '(none)') as utm_medium,
  coalesce(utm_campaign, '(none)') as utm_campaign,
  count(*) filter (where event_name = 'landing_viewed') as landing_views,
  count(*) filter (where event_name = 'test_started') as test_starts,
  count(*) filter (where event_name = 'result_viewed') as result_views,
  count(*) filter (where event_name = 'share_clicked') as share_clicks,
  count(*) filter (where event_name = 'opt_in_submitted') as opt_ins
from public.page_events
group by 1, 2, 3
order by landing_views desc, test_starts desc;
```

## Completion Funnel

```sql
with started as (
  select distinct session_id
  from public.page_events
  where event_name = 'test_started'
    and session_id is not null
),
resulted as (
  select distinct session_id
  from public.page_events
  where event_name = 'result_viewed'
    and session_id is not null
)
select
  (select count(*) from started) as test_started_sessions,
  (select count(*) from resulted) as result_viewed_sessions,
  round(
    100.0 * (select count(*) from resulted)
    / nullif((select count(*) from started), 0),
    1
  ) as completion_rate_percent;
```

## Share, Opt-In, And Retake Rates

```sql
with result_sessions as (
  select distinct session_id
  from public.page_events
  where event_name = 'result_viewed'
    and session_id is not null
),
action_sessions as (
  select
    event_name,
    count(distinct session_id) as sessions
  from public.page_events
  where event_name in ('share_clicked', 'opt_in_submitted', 'retake_clicked')
    and session_id is not null
  group by event_name
)
select
  action_sessions.event_name,
  action_sessions.sessions,
  round(
    100.0 * action_sessions.sessions
    / nullif((select count(*) from result_sessions), 0),
    1
  ) as rate_after_result_percent
from action_sessions
order by action_sessions.event_name;
```

## Basic Test Result Summary

```sql
select
  count(*) as completed_tests,
  round(avg(total_score), 2) as average_score,
  round(avg(vocabulary_score), 2) as average_vocabulary,
  round(avg(grammar_score), 2) as average_grammar,
  round(avg(reading_score), 2) as average_reading,
  round(avg(workplace_score), 2) as average_workplace
from public.test_attempts;
```

## Weakest Sections Frequency

```sql
select
  section,
  count(*) as frequency
from public.test_attempts,
lateral unnest(weakest_sections) as section
group by section
order by frequency desc;
```

## Recent Raw Event Export

Use this when you want a spreadsheet-style export. Avoid joining this with `opt_in_leads` unless you truly need contact follow-up operations.

```sql
select
  created_at,
  event_name,
  path,
  session_id,
  attempt_id,
  utm_source,
  utm_medium,
  utm_campaign,
  metadata
from public.page_events
order by created_at desc
limit 1000;
```

## Copy This Into ChatGPT

```text
Period:
Total landing_viewed:
Total test_intro_viewed:
Total test_started:
Total test_submitted:
Total result_viewed:
Total share_clicked:
Total opt_in_submitted:
Total retake_clicked:
Average score:
Section averages:
Top weakest sections:
UTM breakdown:

Analyze this K-Work Daily Practice first-user test data. Identify funnel drop-offs, UX problems, and next product actions.
```
