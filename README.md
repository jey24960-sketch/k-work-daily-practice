# K-Work Tayari

K-Work Tayari is an independent EPS-TOPIK practice service for Nepali learners preparing to work in Korea.

Version 0.1 is a free mobile-first EPS-TOPIK level test MVP with local question data, localStorage state, scoring, section feedback, and answer review.

K-Work Tayari is not affiliated with HRD Korea, EPS Korea, EPS Nepal, or any government agency. The questions are original practice questions and are not official exam questions.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Local TypeScript question data
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

Supabase is optional in local development. Without these variables, the test and result pages still work, but anonymous attempt storage and result-page opt-in submission are skipped.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Create the lightweight validation tables by pasting [supabase/schema.sql](supabase/schema.sql) into the Supabase SQL Editor.

## MVP Scope

Version 0.1 intentionally does not include login, payments, an admin dashboard, certificates, AI features, or official EPS/HRD Korea branding.
