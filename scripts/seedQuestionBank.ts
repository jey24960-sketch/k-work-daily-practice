/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs") as typeof import("node:fs");
const path = require("node:path") as typeof import("node:path");
const vm = require("node:vm") as typeof import("node:vm");
const ts = require("typescript") as typeof import("typescript");
const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");

type PracticeQuestionSeed = {
  id: string;
  section: string;
  context: string;
  difficulty: string;
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
  sourceType: string;
  referenceScope: string;
  officialNotice: string;
};

type QuestionSetSeed = {
  id: string;
  name: string;
  type: string;
  purpose: string | null;
  isActive: boolean;
  items: PracticeQuestionSeed[];
};

type QuestionSets = Map<string, QuestionSetSeed>;
type SupabaseQueryResult = PromiseLike<{
  error: { message: string } | null;
}>;

const rootDir = process.cwd();
const officialNotice =
  "This is an original practice question. It is not an official EPS-TOPIK question and is not copied from any official textbook or past exam.";

loadEnvFile(".env");
loadEnvFile(".env.local");

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Use this only locally or in a secure server environment.",
    );
  }

  const questionPool = loadQuestionPool();
  const questionSets = buildQuestionSets(questionPool);
  const validationIssues = validate(questionPool, questionSets);

  if (validationIssues.length) {
    throw new Error(
      `Question bank validation failed:\n${validationIssues
        .map((issue) => `- ${issue}`)
        .join("\n")}`,
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const questionsPayload = questionPool.map((question) => ({
    id: question.id,
    section: question.section,
    context: question.context,
    difficulty: question.difficulty,
    tags: question.tags,
    question: question.question,
    options: question.options,
    answer: question.answer,
    explanation_en: question.explanationEn,
    explanation_ne: question.explanationNe,
    source_type: question.sourceType,
    reference_scope: question.referenceScope,
    official_notice: question.officialNotice,
    status: question.usage.isActive ? "published" : "draft",
    is_active: question.usage.isActive,
  }));

  await throwOnError(
    supabase.from("questions").upsert(questionsPayload, { onConflict: "id" }),
    "upsert questions",
  );

  const setPayload = [...questionSets.values()].map((set) => ({
    id: set.id,
    name: set.name,
    type: set.type,
    purpose: set.purpose,
    status: set.isActive ? "published" : "draft",
    is_active: set.isActive,
  }));

  await throwOnError(
    supabase.from("question_sets").upsert(setPayload, { onConflict: "id" }),
    "upsert question sets",
  );

  const managedSetIds = [...questionSets.keys()];
  await throwOnError(
    supabase.from("question_set_items").delete().in("set_id", managedSetIds),
    "clear managed question set items",
  );

  const itemPayload = [...questionSets.values()].flatMap((set) =>
    set.items.map((question, index) => ({
      set_id: set.id,
      question_id: question.id,
      order_index: index,
    })),
  );

  if (itemPayload.length) {
    await throwOnError(
      supabase
        .from("question_set_items")
        .upsert(itemPayload, { onConflict: "set_id,question_id" }),
      "upsert question set items",
    );
  }

  console.log(
    `Seeded ${questionsPayload.length} questions, ${setPayload.length} sets, and ${itemPayload.length} set items.`,
  );
}

async function throwOnError(query: SupabaseQueryResult, label: string) {
  const { error } = await query;
  if (error) throw new Error(`Failed to ${label}: ${error.message}`);
}

function loadQuestionPool(): PracticeQuestionSeed[] {
  const dataFile = path.join(rootDir, "data", "questions.ts");
  const source = fs.readFileSync(dataFile, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: dataFile,
  }).outputText;

  const exports = {};
  const cjsModule: { exports: { questionPool?: PracticeQuestionSeed[] } } = {
    exports,
  };
  const sandbox = {
    exports,
    module: cjsModule,
    require: (specifier: string) => {
      if (specifier === "@/lib/questionUtils") {
        return {
          getChoiceByKey: () => undefined,
          getChoiceEntries: () => [],
          getCorrectChoiceKey: () => undefined,
        };
      }
      throw new Error(`Unexpected import in seed source: ${specifier}`);
    },
  };

  vm.runInNewContext(compiled, sandbox, { filename: dataFile });
  if (!cjsModule.exports.questionPool) {
    throw new Error("Could not load questionPool from data/questions.ts.");
  }
  return cjsModule.exports.questionPool;
}

function buildQuestionSets(questions: PracticeQuestionSeed[]) {
  const sets: QuestionSets = new Map();
  addExpectedSets(sets);

  for (const question of questions) {
    for (const setId of question.usage.levelTestSets) addItem(sets, setId, question);
    for (const setId of question.usage.dailyPracticeSets) addItem(sets, setId, question);
    if (question.usage.marketing) addItem(sets, "marketingQuestions", question);
    if (question.usage.replacementPool) addItem(sets, "replacementPool", question);
  }

  return sets;
}

function addExpectedSets(sets: QuestionSets) {
  addSet(
    sets,
    "levelTestSetA",
    "Free Level Test Set A",
    "level_test",
    "Default public diagnostic level test.",
    true,
  );
  addSet(
    sets,
    "levelTestSetB",
    "Free Level Test Set B",
    "level_test",
    "Prepared alternate level test set; not exposed in the UI yet.",
    false,
  );

  for (let index = 1; index <= 20; index += 1) {
    const suffix = String(index).padStart(2, "0");
    addSet(
      sets,
      `dailySet${suffix}`,
      `Daily Practice Set ${suffix}`,
      "daily_practice",
      "Five-question daily practice set; data-only until the Daily Practice UI is implemented.",
      false,
    );
  }

  addSet(
    sets,
    "marketingQuestions",
    "Marketing Questions",
    "marketing",
    "Short practice questions for future marketing content.",
    false,
  );
  addSet(
    sets,
    "replacementPool",
    "Replacement Pool",
    "replacement",
    "Backup questions for future replacement and balancing workflows.",
    false,
  );
}

function addSet(
  sets: QuestionSets,
  id: string,
  name: string,
  type: string,
  purpose: string | null,
  isActive: boolean,
) {
  if (!sets.has(id)) {
    sets.set(id, { id, name, type, purpose, isActive, items: [] });
  }
}

function addItem(
  sets: QuestionSets,
  setId: string,
  question: PracticeQuestionSeed,
) {
  if (!sets.has(setId)) {
    const type = setId.startsWith("dailySet") ? "daily_practice" : "level_test";
    addSet(sets, setId, setId, type, null, false);
  }
  sets.get(setId)?.items.push(question);
}

function validate(questions: PracticeQuestionSeed[], sets: QuestionSets) {
  const issues: string[] = [];
  const ids = new Set();
  const dangerousPhrases = [
    "real exam",
    "past question",
    "copied from official",
    "leaked",
    "secret",
    "guaranteed pass",
    "pass guarantee",
    "100% success",
    "hrd korea official",
    "eps korea official",
    "eps nepal official",
  ];

  for (const question of questions) {
    if (ids.has(question.id)) issues.push(`${question.id}: duplicate id`);
    ids.add(question.id);
    if (question.sourceType !== "original") {
      issues.push(`${question.id}: sourceType must be original`);
    }
    if (question.officialNotice !== officialNotice) {
      issues.push(`${question.id}: officialNotice is not standardized`);
    }
    const requiredText = {
      referenceScope: question.referenceScope,
      explanationEn: question.explanationEn,
      explanationNe: question.explanationNe,
      question: question.question,
      answer: question.answer,
    };

    for (const [field, value] of Object.entries(requiredText)) {
      if (!value.trim()) issues.push(`${question.id}: ${field} is empty`);
    }
    if (question.options.length !== 4) {
      issues.push(`${question.id}: options must contain exactly 4 choices`);
    }
    if (question.options.some((option) => typeof option !== "string" || !option.trim())) {
      issues.push(`${question.id}: every option must be a non-empty string`);
    }
    if (!question.options.includes(question.answer)) {
      issues.push(`${question.id}: answer is not one of the options`);
    }

    const text = [
      question.question,
      ...question.options,
      question.answer,
      question.explanationEn,
      question.explanationNe,
      question.referenceScope,
    ].join(" ");

    if (/\b(placeholder|tbd|todo|coming soon)\b/i.test(text)) {
      issues.push(`${question.id}: contains placeholder text`);
    }

    const lowerText = text.toLowerCase();
    if (lowerText.includes("official question")) {
      issues.push(`${question.id}: contains restricted wording "official question"`);
    }
    const dangerousPhrase = dangerousPhrases.find((phrase) =>
      lowerText.includes(phrase),
    );
    if (dangerousPhrase) {
      issues.push(`${question.id}: contains restricted wording "${dangerousPhrase}"`);
    }
  }

  validateSet(issues, "levelTestSetA", sets.get("levelTestSetA")?.items ?? [], 20, {
    section: { Vocabulary: 5, Grammar: 5, Reading: 5, "Workplace Korean": 5, "Mixed Review": 0 },
    difficulty: { easy: 8, medium: 10, hard: 2 },
  });

  const setB = sets.get("levelTestSetB")?.items ?? [];
  if (setB.length) {
    validateSet(issues, "levelTestSetB", setB, 20, {
      section: { Vocabulary: 5, Grammar: 5, Reading: 5, "Workplace Korean": 5, "Mixed Review": 0 },
      difficulty: { easy: 7, medium: 11, hard: 2 },
    });
  }

  for (const [setId, set] of sets) {
    if (!/^dailySet\d{2}$/.test(setId) || !set.items.length) continue;
    validateSet(issues, setId, set.items, 5, {
      section: { Vocabulary: 1, Grammar: 1, Reading: 1, "Workplace Korean": 1, "Mixed Review": 1 },
    });
  }

  return issues;
}

function validateSet(
  issues: string[],
  setId: string,
  questions: PracticeQuestionSeed[],
  total: number,
  expected: Partial<Record<"section" | "difficulty", Record<string, number>>>,
) {
  if (questions.length !== total) {
    issues.push(`${setId}: expected ${total} questions, found ${questions.length}`);
  }
  for (const [field, counts] of Object.entries(expected) as [
    "section" | "difficulty",
    Record<string, number>,
  ][]) {
    const actual = countBy(questions, field);
    for (const [key, expectedCount] of Object.entries(counts)) {
      if ((actual[key] ?? 0) !== expectedCount) {
        issues.push(`${setId}: expected ${key}=${expectedCount}, found ${actual[key] ?? 0}`);
      }
    }
  }
}

function countBy(items: PracticeQuestionSeed[], key: "section" | "difficulty") {
  return items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}

function loadEnvFile(fileName: string) {
  const filePath = path.join(rootDir, fileName);
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
