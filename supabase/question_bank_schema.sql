create extension if not exists "pgcrypto";

create or replace function public.question_options_are_four_strings(options jsonb)
returns boolean
language sql
immutable
as $$
  select case
    when jsonb_typeof(options) <> 'array' then false
    else
      jsonb_array_length(options) = 4
      and not exists (
        select 1
        from jsonb_array_elements(options) as option_value
        where jsonb_typeof(option_value) <> 'string'
      )
    end;
$$;

create or replace function public.question_answer_is_option(
  options jsonb,
  answer text
)
returns boolean
language sql
immutable
as $$
  select case
    when jsonb_typeof(options) <> 'array' then false
    else exists (
      select 1
      from jsonb_array_elements_text(options) as option_value
      where option_value = answer
    )
    end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.questions (
  id text primary key,
  section text not null,
  context text not null,
  difficulty text not null,
  tags text[] not null default '{}',
  question text not null,
  options jsonb not null,
  answer text not null,
  explanation_en text not null,
  explanation_ne text not null,
  source_type text not null default 'original',
  reference_scope text not null,
  official_notice text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_section_check check (
    section in (
      'Vocabulary',
      'Grammar',
      'Reading',
      'Workplace Korean',
      'Mixed Review'
    )
  ),
  constraint questions_difficulty_check check (
    difficulty in ('easy', 'medium', 'hard')
  ),
  constraint questions_source_type_check check (source_type = 'original'),
  constraint questions_options_check check (
    public.question_options_are_four_strings(options)
  ),
  constraint questions_answer_check check (
    public.question_answer_is_option(options, answer)
  ),
  constraint questions_question_check check (
    length(trim(question)) > 0
  ),
  constraint questions_answer_not_empty_check check (
    length(trim(answer)) > 0
  ),
  constraint questions_explanation_en_check check (
    length(trim(explanation_en)) > 0
  ),
  constraint questions_explanation_ne_check check (
    length(trim(explanation_ne)) > 0
  ),
  constraint questions_official_notice_check check (
    official_notice = 'This is an original practice question. It is not an official EPS-TOPIK question and is not copied from any official textbook or past exam.'
  )
);

create table if not exists public.question_sets (
  id text primary key,
  name text not null,
  type text not null,
  purpose text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_sets_type_check check (
    type in (
      'level_test',
      'daily_practice',
      'marketing',
      'replacement_pool'
    )
  )
);

create table if not exists public.question_set_items (
  set_id text not null references public.question_sets(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  order_index integer not null,
  created_at timestamptz not null default now(),
  primary key (set_id, question_id),
  constraint question_set_items_order_index_check check (order_index >= 0),
  constraint question_set_items_set_order_unique unique (set_id, order_index)
);

create table if not exists public.question_attempt_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid,
  question_id text not null,
  set_id text,
  selected_answer text,
  correct_answer text,
  is_correct boolean,
  section text,
  difficulty text,
  created_at timestamptz not null default now()
);

drop trigger if exists set_questions_updated_at on public.questions;
create trigger set_questions_updated_at
before update on public.questions
for each row
execute function public.set_updated_at();

drop trigger if exists set_question_sets_updated_at on public.question_sets;
create trigger set_question_sets_updated_at
before update on public.question_sets
for each row
execute function public.set_updated_at();

alter table public.questions enable row level security;
alter table public.question_sets enable row level security;
alter table public.question_set_items enable row level security;
alter table public.question_attempt_events enable row level security;

revoke all on public.questions from anon, authenticated;
revoke all on public.question_sets from anon, authenticated;
revoke all on public.question_set_items from anon, authenticated;
revoke all on public.question_attempt_events from anon, authenticated;

grant usage on schema public to anon;
grant select on public.questions to anon;
grant select on public.question_sets to anon;
grant select on public.question_set_items to anon;
grant insert on public.question_attempt_events to anon;

drop policy if exists "Allow anonymous select active questions" on public.questions;
create policy "Allow anonymous select active questions"
on public.questions
for select
to anon
using (is_active = true);

drop policy if exists "Allow anonymous select active question sets" on public.question_sets;
create policy "Allow anonymous select active question sets"
on public.question_sets
for select
to anon
using (is_active = true);

drop policy if exists "Allow anonymous select active question set items" on public.question_set_items;
create policy "Allow anonymous select active question set items"
on public.question_set_items
for select
to anon
using (
  exists (
    select 1
    from public.question_sets
    where question_sets.id = question_set_items.set_id
      and question_sets.is_active = true
  )
  and exists (
    select 1
    from public.questions
    where questions.id = question_set_items.question_id
      and questions.is_active = true
  )
);

drop policy if exists "Allow anonymous insert question attempt events" on public.question_attempt_events;
create policy "Allow anonymous insert question attempt events"
on public.question_attempt_events
for insert
to anon
with check (true);

create index if not exists idx_questions_section
on public.questions (section);

create index if not exists idx_questions_difficulty
on public.questions (difficulty);

create index if not exists idx_questions_is_active
on public.questions (is_active);

create index if not exists idx_questions_tags
on public.questions using gin (tags);

create index if not exists idx_question_sets_type
on public.question_sets (type);

create index if not exists idx_question_sets_is_active
on public.question_sets (is_active);

create index if not exists idx_question_set_items_set_order
on public.question_set_items (set_id, order_index);

create index if not exists idx_question_set_items_question_id
on public.question_set_items (question_id);

create index if not exists idx_question_attempt_events_question_id
on public.question_attempt_events (question_id);

create index if not exists idx_question_attempt_events_set_id
on public.question_attempt_events (set_id);

create index if not exists idx_question_attempt_events_created_at
on public.question_attempt_events (created_at desc);
