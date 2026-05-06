import {
  getActiveQuestions as getLocalActiveQuestions,
  getDailyPracticeSet as getLocalDailyPracticeSet,
  getLevelTestSet as getLocalLevelTestSet,
  getMarketingQuestions as getLocalMarketingQuestions,
  getReplacementPool as getLocalReplacementPool,
} from "../../data/questions";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { trackExamEvent } from "@/lib/pageEvents";
import {
  validateQuestions,
  validateQuestionSetComposition,
} from "@/lib/questionValidation";
import type {
  PracticeQuestion,
  QuestionSection,
  QuestionSourceType,
} from "@/types/questions";

type LevelTestSetId = "levelTestSetA" | "levelTestSetB";

type QuestionRow = {
  id: string;
  section: QuestionSection;
  context: string;
  difficulty: PracticeQuestion["difficulty"];
  tags: string[] | null;
  question: string;
  options: unknown;
  answer: string;
  explanation_en: string;
  explanation_ne: string;
  source_type: QuestionSourceType;
  reference_scope: string;
  official_notice: PracticeQuestion["officialNotice"];
  is_active: boolean;
};

type QuestionSetItemRow = {
  order_index: number;
  questions: QuestionRow | QuestionRow[] | null;
};

type QuestionBankFallbackReason =
  | "missing_env"
  | "query_error"
  | "empty_data"
  | "validation_failed"
  | "unknown";

export async function getLevelTestSet(
  setId: LevelTestSetId,
): Promise<PracticeQuestion[]> {
  return getQuestionSet(setId, () => getLocalLevelTestSet(setId));
}

export async function getDailyPracticeSet(
  setId: string,
): Promise<PracticeQuestion[]> {
  return getQuestionSet(setId, () => getLocalDailyPracticeSet(setId));
}

export async function getMarketingQuestions(): Promise<PracticeQuestion[]> {
  return getQuestionSet("marketingQuestions", getLocalMarketingQuestions);
}

export async function getReplacementPool(
  section?: QuestionSection,
): Promise<PracticeQuestion[]> {
  const questions = await getQuestionSet("replacementPool", () =>
    getLocalReplacementPool(section),
  );

  if (!section) return questions;
  return questions.filter((question) => question.section === section);
}

export async function getActiveQuestions(): Promise<PracticeQuestion[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return getFallbackQuestions("activeQuestions", "missing_env", getLocalActiveQuestions);
  }

  try {
    const { data, error } = await supabase
      .from("questions")
      .select(
        "id, section, context, difficulty, tags, question, options, answer, explanation_en, explanation_ne, source_type, reference_scope, official_notice, is_active",
      )
      .eq("is_active", true)
      .order("id");

    if (error) {
      return getFallbackQuestions("activeQuestions", "query_error", getLocalActiveQuestions);
    }

    if (!data?.length) {
      return getFallbackQuestions("activeQuestions", "empty_data", getLocalActiveQuestions);
    }

    const questions = data.map((row) => mapQuestionRow(row as QuestionRow));
    const issues = validateQuestions(questions);

    if (issues.length) {
      return getFallbackQuestions(
        "activeQuestions",
        "validation_failed",
        getLocalActiveQuestions,
      );
    }

    return questions;
  } catch {
    return getFallbackQuestions("activeQuestions", "query_error", getLocalActiveQuestions);
  }
}

async function getQuestionSet(
  setId: string,
  fallback: () => PracticeQuestion[],
): Promise<PracticeQuestion[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return getFallbackQuestions(setId, "missing_env", fallback);

  try {
    const { data, error } = await supabase
      .from("question_set_items")
      .select(
        "order_index, questions(id, section, context, difficulty, tags, question, options, answer, explanation_en, explanation_ne, source_type, reference_scope, official_notice, is_active)",
      )
      .eq("set_id", setId)
      .order("order_index", { ascending: true });

    if (error) {
      return getFallbackQuestions(setId, "query_error", fallback);
    }

    if (!data?.length) {
      return getFallbackQuestions(setId, "empty_data", fallback);
    }

    const questions = (data as QuestionSetItemRow[])
      .map((item) => firstQuestionRow(item.questions))
      .filter((question): question is QuestionRow => Boolean(question))
      .map(mapQuestionRow);

    const issues = [
      ...validateQuestions(questions),
      ...validateQuestionSetComposition(setId, questions),
    ];

    if (!questions.length || issues.length) {
      return getFallbackQuestions(setId, "validation_failed", fallback);
    }

    return questions;
  } catch {
    return getFallbackQuestions(setId, "query_error", fallback);
  }
}

function getFallbackQuestions(
  setId: string,
  reason: QuestionBankFallbackReason,
  fallback: () => PracticeQuestion[],
) {
  warnQuestionBankFallback(`${setId} fallback reason: ${reason}`);
  void trackExamEvent("question_bank_fallback", { setId, reason });

  try {
    const questions = fallback();
    if (!questions.length) {
      void trackExamEvent("exam_load_failed", {
        setId,
        reason: "empty_data",
      });
    }
    return questions;
  } catch {
    void trackExamEvent("exam_load_failed", {
      setId,
      reason: "unknown",
    });
    return [];
  }
}

function firstQuestionRow(row: QuestionRow | QuestionRow[] | null) {
  return Array.isArray(row) ? row[0] : row;
}

function mapQuestionRow(row: QuestionRow): PracticeQuestion {
  return {
    id: row.id,
    section: row.section,
    context: row.context,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
    usage: {
      levelTestSets: [],
      dailyPracticeSets: [],
      marketing: false,
      replacementPool: false,
      isActive: row.is_active,
    },
    question: row.question,
    options: normalizeOptions(row.options),
    answer: row.answer,
    explanationEn: row.explanation_en,
    explanationNe: row.explanation_ne,
    sourceType: row.source_type,
    referenceScope: row.reference_scope,
    officialNotice: row.official_notice,
  };
}

function normalizeOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  return options.filter((option): option is string => typeof option === "string");
}

function warnQuestionBankFallback(reason: string) {
  if (process.env.NODE_ENV !== "development") return;
  console.warn(
    `Using local question fallback because Supabase question bank ${reason}.`,
  );
}
