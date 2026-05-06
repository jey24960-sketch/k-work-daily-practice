# K-Work Daily Practice

K-Work Daily Practice is an independent EPS-TOPIK practice service for Nepali learners preparing to work in Korea.

Version 0.1 is a free mobile-first EPS-TOPIK level test MVP with a Supabase-backed question bank, local Set A fallback, localStorage state, scoring, section feedback, and answer review.

K-Work Daily Practice is not affiliated with HRD Korea, EPS Korea, EPS Nepal, or any government agency. The questions are original practice questions and are not official exam questions.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase question bank
- Local TypeScript Set A fallback
- Browser localStorage

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
```

## Supabase Environment

Supabase is optional in local development. Without these variables, the test and result pages still work, but anonymous attempt storage, result-page opt-in submission, and share tracking are skipped.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Create the lightweight validation tables by pasting [supabase/schema.sql](supabase/schema.sql) into the Supabase SQL Editor.

Create the question bank by running [supabase/question_bank_schema.sql](supabase/question_bank_schema.sql), then seed with either:

```bash
npm run question-bank:seed
```

and paste [supabase/question_bank_seed.sql](supabase/question_bank_seed.sql), or run the secure local service-role seed:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key npm run question-bank:seed:supabase
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code or prefix it with `NEXT_PUBLIC`.

### Local Supabase Insert Test

1. Create a Supabase project.
2. Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor.
3. Add `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Run `npm run dev`.
5. Open [http://localhost:3000](http://localhost:3000).
6. Complete one 20-question test and reach the result page.
7. Confirm one new row exists in `public.test_attempts`.
8. Submit the result-page opt-in form with a contact value.
9. Confirm one new row exists in `public.opt_in_leads`.
10. Click a share button.
11. Confirm one new row exists in `public.share_events`.

### Vercel Supabase Insert Test

1. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings.
2. Redeploy the project so the public Supabase values are included in the client bundle.
3. Complete the same test flow on the live URL.
4. Confirm rows in Supabase Table Editor for `test_attempts`, `opt_in_leads`, and `share_events`.

## MVP Scope

Version 0.1 intentionally does not include login, payments, an admin dashboard, certificates, AI features, or government-style EPS/HRD Korea branding.

## Question Content Data

The question bank schema is documented in [docs/question-bank-database.md](docs/question-bank-database.md). The app loads `levelTestSetA` from Supabase first and falls back to the local Set A from `data/questions.ts` if the DB fetch fails or returns invalid data. Daily Practice remains unimplemented.
