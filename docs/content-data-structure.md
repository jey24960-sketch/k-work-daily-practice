# Content Data Structure

K-Work Daily Practice stores practice questions in local TypeScript data for now. The current app uses only `getLevelTestSet("levelTestSetA")` for the 20-question Free Level Test.

Supabase is not used for question storage at this stage. Supabase remains only for optional validation inserts such as test attempts, opt-in leads, and share events.

## Planned Operating Pool

| Pool | Count | Purpose | Composition | Difficulty |
| --- | ---: | --- | --- | --- |
| Free Level Test Set A | 20 | First public diagnostic test | Vocabulary 5, Grammar 5, Reading 5, Workplace Korean 5 | Easy 8, Medium 10, Hard 2 |
| Free Level Test Set B | 20 | A/B test and retake set | Vocabulary 5, Grammar 5, Reading 5, Workplace Korean 5 | Easy 7, Medium 11, Hard 2 |
| Daily Practice | 100 | 20 sets x 5 questions for short repeat practice | Per set: Vocabulary 1, Grammar 1, Reading 1, Workplace Korean 1, Mixed Review 1 | Easy to Medium focused |
| Marketing Questions | 30 | SNS comments, card news, Shorts, quick engagement posts | Vocabulary 10, Grammar 6, Reading 6, Workplace Korean 8 | Easy focused |
| Replacement Pool | 100 | Backup questions for weak items, replacement, balancing | Vocabulary 25, Grammar 25, Reading 25, Workplace Korean 25 | Easy 40, Medium 50, Hard 10 |

## Planned Section Totals

| Section | Count |
| --- | ---: |
| Vocabulary | 65 |
| Grammar | 61 |
| Reading | 61 |
| Workplace Korean | 63 |
| Mixed Review | 20 |
| Total | 270 |

## Question Schema

Each item in `data/questions.ts` must match `PracticeQuestion` from `src/types/questions.ts`:

- `id`: stable string such as `lt-a-vocab-001`, `lt-b-reading-004`, `daily-01-mixed-005`, or `pool-grammar-034`
- `section`: `Vocabulary`, `Grammar`, `Reading`, `Workplace Korean`, or `Mixed Review`
- `context`: short category such as `daily_life`, `workplace`, `manufacturing`, `safety`, or `administrative`
- `difficulty`: `easy`, `medium`, or `hard`
- `tags`: topic labels for filtering and content management
- `usage`: flexible assignment object for level tests, daily sets, marketing, and replacement pool
- `question`: Korean prompt text
- `options`: exactly four answer options
- `answer`: exact correct option text
- `explanationEn`: English explanation
- `explanationNe`: Nepali explanation, or `Nepali explanation coming soon.`
- `sourceType`: always `original`
- `referenceScope`: broad scope note for topic and difficulty alignment
- `officialNotice`: standard originality notice

Confirmed TypeScript shape:

```ts
type PracticeQuestion = {
  id: string;
  section:
    | "Vocabulary"
    | "Grammar"
    | "Reading"
    | "Workplace Korean"
    | "Mixed Review";
  context: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  usage: {
    levelTestSets: string[];
    dailyPracticeSets: string[];
    marketing: boolean;
    replacementPool: boolean;
    isActive: boolean;
  };
  question: string;
  options: string[];
  answer: string;
  explanationEn: string;
  explanationNe: string;
  sourceType: "original";
  referenceScope: string;
  officialNotice: "This is an original practice question. It is not an official EPS-TOPIK question and is not copied from any official textbook or past exam.";
};
```

## Usage Shape

```ts
usage: {
  levelTestSets: string[];
  dailyPracticeSets: string[];
  marketing: boolean;
  replacementPool: boolean;
  isActive: boolean;
}
```

## Assignment Examples

Level Test Set A:

```ts
usage: {
  levelTestSets: ["levelTestSetA"],
  dailyPracticeSets: [],
  marketing: false,
  replacementPool: false,
  isActive: true,
}
```

Level Test Set B:

```ts
usage: {
  levelTestSets: ["levelTestSetB"],
  dailyPracticeSets: [],
  marketing: false,
  replacementPool: false,
  isActive: true,
}
```

Daily Practice `dailySet01` through `dailySet20`:

```ts
usage: {
  levelTestSets: [],
  dailyPracticeSets: ["dailySet01"],
  marketing: false,
  replacementPool: false,
  isActive: true,
}
```

Marketing question:

```ts
usage: {
  levelTestSets: [],
  dailyPracticeSets: [],
  marketing: true,
  replacementPool: false,
  isActive: true,
}
```

Replacement pool question:

```ts
usage: {
  levelTestSets: [],
  dailyPracticeSets: [],
  marketing: false,
  replacementPool: true,
  isActive: true,
}
```

Inactive draft:

```ts
usage: {
  levelTestSets: [],
  dailyPracticeSets: [],
  marketing: false,
  replacementPool: false,
  isActive: false,
}
```

## Content Safety

All app questions must be original practice questions:

```ts
sourceType: "original"
officialNotice: ORIGINAL_QUESTION_NOTICE
```

EPS-TOPIK standard textbooks may be used only for broad topic scope, difficulty range, grammar/vocabulary themes, and workplace context. Do not copy official textbook prompts, answer options, dialogues, passages, listening scripts, or past exam content.

Do not use claims such as official question, real exam question, past question, copied from official textbook, guaranteed pass, or 100% success in user-facing content.

## Standard Reference Scopes

Use these exact `referenceScope` values:

| Section | referenceScope |
| --- | --- |
| Vocabulary | Original practice item aligned with general EPS-TOPIK everyday-life and workplace vocabulary preparation scope. |
| Grammar | Original practice item aligned with common EPS-TOPIK grammar preparation scope. |
| Reading | Original practice item aligned with general EPS-TOPIK short reading and notice comprehension preparation scope. |
| Workplace Korean | Original practice item aligned with general workplace Korean safety and communication preparation scope. |
| Mixed Review | Original practice item aligned with mixed EPS-TOPIK everyday-life, grammar, reading, and workplace communication preparation scope. |

## Current App Behavior

- `levelTestSetA` is the only set used by the current Free Level Test.
- `levelTestSetB` is prepared for future A/B testing or retake variants, but it is not exposed.
- Daily Practice is data-prepared only; no `/daily` route or UI is implemented.
- Marketing and replacement pool questions are data-prepared only; no UI or database storage is implemented.
