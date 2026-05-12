# Internal Question Import Console

## Purpose

The v0.2-alpha Internal Question Import Console is a controlled utility for operating original EPS-TOPIK practice question content. It lets an internal operator upload generated question JSON, validate it, inspect errors and warnings, import valid content as draft/inactive rows, and publish a selected validated set.

This is intentionally not a full admin CMS, public login system, academy account system, payment feature, rich editor, statistics dashboard, Daily Practice UI, marketing question UI, or replacement-pool UI.

## Required Environment Variables

Public client variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server-only variables:

```bash
ADMIN_IMPORT_TOKEN=
SUPABASE_SERVICE_ROLE_KEY=
```

Never prefix `SUPABASE_SERVICE_ROLE_KEY` or `ADMIN_IMPORT_TOKEN` with `NEXT_PUBLIC_`. The admin token only gates the internal routes. Database writes use the service role from server route handlers only.

## SQL Setup

Run [../supabase/internal_question_import_schema.sql](../supabase/internal_question_import_schema.sql) in the Supabase SQL Editor. It adds:

- `questions.status`
- `question_sets.status`
- `import_batches`
- draft/validated/published/archived status checks
- published + active anon SELECT RLS policies
- no anon access to `import_batches`

The SQL is additive where possible and preserves the existing public-test tables: `test_attempts`, `opt_in_leads`, `share_events`, `page_events`, and `question_attempt_events` if present.

## JSON Formats

Flat array:

```json
[
  {
    "id": "lt-b-vocab-001",
    "section": "Vocabulary",
    "context": "workplace",
    "difficulty": "easy",
    "tags": ["vocabulary"],
    "usage": {
      "levelTestSets": ["levelTestSetB"],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": false
    },
    "question": "Sample question text",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanationEn": "English explanation.",
    "explanationNe": "Nepali explanation.",
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK preparation scope.",
    "officialNotice": "This is an original practice question. It is not an official EPS-TOPIK question and is not copied from any official textbook or past exam."
  }
]
```

Object with `questions`:

```json
{
  "questions": []
}
```

Object with named arrays:

```json
{
  "levelTestSetBQuestions": [],
  "dailyPracticeQuestions": [],
  "marketingQuestions": [],
  "replacementPoolQuestions": []
}
```

Set membership comes from `usage`. Named arrays can provide default usage for level-test, marketing, and replacement imports.

## Validation Rules

Question errors block import:

- required unique `id`
- allowed `section`
- allowed `difficulty`
- exactly 4 string options
- no duplicate options
- `answer` exactly matches one option
- non-empty `question`, `answer`, `explanationEn`, `explanationNe`, and `referenceScope`
- `sourceType === "original"`
- exact standard `officialNotice`
- banned phrase check
- placeholder phrase check

Set errors block publish/import:

- `levelTestSetA`: 20 questions, 5 each Vocabulary/Grammar/Reading/Workplace Korean, 0 Mixed Review, 8 easy, 10 medium, 2 hard
- `levelTestSetB`: 20 questions, 5 each Vocabulary/Grammar/Reading/Workplace Korean, 0 Mixed Review, 7 easy, 11 medium, 2 hard
- `dailySetXX`: 5 questions, 1 each section including Mixed Review

Warnings do not block import:

- very long question text
- very long explanations
- repeated tags
- missing optional context detail
- duplicate-like question text
- marketing/replacement content imported but not used by the customer app

## Lifecycle

1. Open `/admin/questions/import`.
2. Enter `ADMIN_IMPORT_TOKEN` or pass `?token=...`.
3. Upload JSON.
4. Validate.
5. If errors exist, fix the source JSON and re-upload.
6. If there are zero errors, import as draft.
7. Draft rows are written with `status = 'draft'` and `is_active = false`.
8. Select a set and publish it.
9. Publish revalidates the set, then updates the selected `question_sets` row and linked `questions` rows to `status = 'published'` and `is_active = true`.

## Customer Loading Rule

The customer-facing app only loads Supabase rows where:

- `question_sets.status = 'published'`
- `question_sets.is_active = true`
- `questions.status = 'published'`
- `questions.is_active = true`

If Supabase env vars are missing, fetch fails, the set is missing, unpublished, inactive, has the wrong count/composition, or contains invalid data, the app falls back to local `levelTestSetA`.

The local fallback is mandatory and must not be removed.

## Recovery

If import fails:

- Check the error shown in the console UI.
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set only server-side.
- Confirm the SQL schema file was applied.
- Re-run validation before retrying import.
- Draft data is not visible to customers unless a set is published and active.

If publishing fails:

- Check validation errors returned by the publish action.
- Confirm the set has items.
- Fix and re-import the JSON as draft, then publish again.

## Official Content Rule

Questions must be original practice content. Do not copy official textbook questions, past exam questions, answer options, dialogues, passages, or listening scripts. Official materials may be used only for broad topic and difficulty reference. The standard official notice is required on every question.
