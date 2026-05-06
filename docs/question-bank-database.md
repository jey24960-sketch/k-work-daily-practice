# Question Bank Database

K-Work Daily Practice now treats Supabase as the production source of truth for practice questions. The local TypeScript data in `data/questions.ts` remains useful as seed/import material and as a development fallback when Supabase is unavailable, but the public app loads Free Level Test Set A through `src/lib/questionBank.ts`.

## Tables

`public.questions` stores the canonical question body:

- `id`, `section`, `context`, `difficulty`, `tags`
- `question`, `options`, `answer`
- `explanation_en`, `explanation_ne`
- `source_type`, `reference_scope`, `official_notice`
- `is_active`, `created_at`, `updated_at`

The schema checks that sections and difficulty values are allowed, `source_type` is always `original`, `options` is a JSON array of exactly four strings, `answer` is one of those options, explanations are non-empty, and `official_notice` matches the standard originality notice.

`public.question_sets` stores named pools such as:

- `levelTestSetA`
- `levelTestSetB`
- `dailySet01` through `dailySet20`
- `marketingQuestions`
- `replacementPool`

Allowed `type` values are `level_test`, `daily_practice`, `marketing`, and `replacement_pool`.

`public.question_set_items` controls set membership and order with `set_id`, `question_id`, and `order_index`. This is what lets the same question appear in a future set without duplicating the question body.

`public.question_attempt_events` is available for future item-level correctness and quality analysis. The current app does not wire it yet.

## RLS Summary

RLS is enabled on all question-bank tables.

Anonymous users can:

- Select active rows from `questions`.
- Select active rows from `question_sets`.
- Select `question_set_items` only when both the linked set and linked question are active.
- Insert into `question_attempt_events`.

Anonymous users cannot insert, update, or delete `questions`, `question_sets`, or `question_set_items`. Admin writes must happen through SQL in Supabase, the Supabase dashboard, or a secure server-side seed process. Never put a `service_role` key in frontend code.

Existing validation/event tables remain separate:

- `test_attempts`
- `opt_in_leads`
- `share_events`

Their existing insert policies are not changed by `supabase/question_bank_schema.sql`.

## Seeding

Preferred secure seed path:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key npm run question-bank:seed:supabase
```

This script reads `data/questions.ts`, validates the question pool and set composition, then upserts into `questions`, `question_sets`, and `question_set_items` with the service-role key. Run it only locally or in a secure server environment.

Generate reviewable/manual seed SQL from the local TS seed data:

```bash
npm run question-bank:seed
```

Validate the seed data without writing SQL:

```bash
npm run question-bank:validate
```

Manual SQL path:

1. Run `supabase/question_bank_schema.sql`.
2. Run `supabase/question_bank_seed.sql`.

Both seed paths upsert questions, upsert all expected set ids, clear managed set membership rows, and reinsert set items in source order. Current seeded content includes Free Level Test Set A. Level Test Set B, Daily Practice, Marketing Questions, and Replacement Pool sets are created inactive for future data and are not exposed to anonymous reads until deliberately activated.

## Adding A Question

Add a new original `PracticeQuestion` to `data/questions.ts` with:

- Stable `id`.
- Exactly four `options`.
- `answer` equal to one option.
- `sourceType: "original"`.
- The standard `officialNotice`.
- Non-empty English and Nepali explanations.
- No placeholder, TODO, or guarantee-style wording.

Then run:

```bash
npm run question-bank:validate
npm run question-bank:seed
```

Apply the regenerated seed SQL to Supabase.

## Assigning Questions To Sets

Set assignment still starts in the seed object:

- Set A/B: add the id to `usage.levelTestSets`.
- Daily Practice: add `dailySet01` through `dailySet20` to `usage.dailyPracticeSets`.
- Marketing: set `usage.marketing` to `true`.
- Replacement Pool: set `usage.replacementPool` to `true`.

The generator converts those assignments into `question_set_items` rows and preserves order from `data/questions.ts`. Daily Practice remains data-only; there is no `/daily` UI in this task.

## Adding Future Sets

For Level Test Set B, add 20 questions assigned to `usage.levelTestSets: ["levelTestSetB"]`. The validator expects Vocabulary 5, Grammar 5, Reading 5, Workplace Korean 5, Mixed Review 0, with easy 7, medium 11, hard 2.

For Daily Practice, add questions assigned to `dailySet01` through `dailySet20`. Each populated daily set must contain exactly five questions: Vocabulary 1, Grammar 1, Reading 1, Workplace Korean 1, and Mixed Review 1.

For Marketing Questions, set `usage.marketing` to `true`. For Replacement Pool, set `usage.replacementPool` to `true`. No Marketing or Replacement UI is implemented in this task.

## Environment Variables

The public app uses the existing anon Supabase variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

A server-only seed script that writes directly to Supabase would need:

- `SUPABASE_SERVICE_ROLE_KEY`

That key must never be committed, exposed as a `NEXT_PUBLIC_` variable, or used in browser code.

No admin page, CMS editor, or problem-management UI is implemented.

## Current App Behavior

The app still defaults to `levelTestSetA`.

`/exam` loads Set A through `getLevelTestSet("levelTestSetA")` from `src/lib/questionBank.ts`. `/result` fetches the same set id for scoring, section breakdowns, weak-area logic, and answer review. If Supabase is unavailable or returns no set rows, the app falls back to local seed data so public testing is not blocked, but Supabase remains the intended source of truth.
