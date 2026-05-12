# Analytics Export For First 100 Users

K-Work Daily Practice uses lightweight Supabase event rows for public-test analysis. There is no dashboard in the app. Export query results from Supabase Table Editor or SQL Editor, then paste the summarized numbers into ChatGPT.

`public.page_events` stores anonymous funnel events only. It should not contain names, emails, phone numbers, WhatsApp numbers, or opt-in contact values. Actual voluntary contact stays only in `public.opt_in_leads`.

`share_clicked` counts share intent after a WhatsApp click, native share completion, or copy action. WhatsApp tracking may represent a click into WhatsApp, not a guaranteed sent message. Web Share cancellations are not counted as successful shares.

Fresh direct `/exam` visits without a local started-at value or `test_started` marker redirect to `/test`. Normal `/test` starts, in-progress refreshes, and retakes keep their own `test_started` tracking marker.

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

## Median And Percentile Scores

```sql
select
  percentile_cont(0.5) within group (order by total_score) as median_score,
  percentile_cont(0.25) within group (order by total_score) as p25_score,
  percentile_cont(0.75) within group (order by total_score) as p75_score,
  percentile_cont(0.9) within group (order by total_score) as p90_score
from public.test_attempts;
```

## Share Channel Breakdown

```sql
select
  coalesce(metadata->>'channel', 'unknown') as channel,
  count(*) as confirmed_share_clicks,
  count(distinct session_id) as sharing_sessions
from public.page_events
where event_name = 'share_clicked'
group by channel
order by confirmed_share_clicks desc;
```

## Share Score Tier Breakdown

```sql
select
  coalesce(metadata->>'scoreTier', 'unknown') as score_tier,
  count(*) as share_clicks,
  count(distinct session_id) as sharing_sessions
from public.page_events
where event_name = 'share_clicked'
group by score_tier
order by share_clicks desc;
```

## Share UTM Performance

```sql
select
  coalesce(utm_medium, '(none)') as share_medium,
  count(*) filter (where event_name = 'landing_viewed') as landing_views,
  count(*) filter (where event_name = 'test_started') as test_starts,
  count(*) filter (where event_name = 'result_viewed') as result_views
from public.page_events
where utm_source = 'share'
  and utm_campaign = 'first_100_test'
group by share_medium
order by landing_views desc, test_starts desc;
```

## Drop-Off Step By Session

```sql
with session_steps as (
  select
    session_id,
    bool_or(event_name = 'landing_viewed') as landed,
    bool_or(event_name = 'test_intro_viewed') as saw_intro,
    bool_or(event_name = 'test_started') as started,
    bool_or(event_name = 'test_submitted') as submitted,
    bool_or(event_name = 'result_viewed') as saw_result
  from public.page_events
  where session_id is not null
  group by session_id
)
select
  case
    when not landed then 'no_landing_event'
    when not saw_intro then 'dropped_before_intro'
    when not started then 'dropped_before_start'
    when not submitted then 'dropped_during_exam'
    when not saw_result then 'dropped_before_result'
    else 'completed_result'
  end as final_step,
  count(*) as sessions
from session_steps
group by final_step
order by sessions desc;
```

## Question Bank Fallback Counts

```sql
select
  metadata->>'setId' as set_id,
  metadata->>'reason' as reason,
  count(*) as fallback_events
from public.page_events
where event_name = 'question_bank_fallback'
group by set_id, reason
order by fallback_events desc;
```

## Exam Load Failures

```sql
select
  metadata->>'setId' as set_id,
  metadata->>'reason' as reason,
  count(*) as load_failures
from public.page_events
where event_name = 'exam_load_failed'
group by set_id, reason
order by load_failures desc;
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
