import "server-only";

import { getSupabaseServiceRoleClient } from "@/lib/supabaseServiceRole";
import {
  buildQuestionSets,
  validateQuestionSetComposition,
  validateQuestions,
  type QuestionSetSummary,
} from "@/lib/questionValidation";
import type { PracticeQuestion } from "@/types/questions";

type ImportQuestionPayload = {
  filename: string;
  payload: unknown;
};

type QuestionSetRow = {
  id: string;
  name: string;
  type: string;
  purpose: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type QuestionRow = {
  id: string;
  section: PracticeQuestion["section"];
  context: string;
  difficulty: PracticeQuestion["difficulty"];
  tags: string[] | null;
  question: string;
  options: unknown;
  answer: string;
  explanation_en: string;
  explanation_ne: string;
  source_type: PracticeQuestion["sourceType"];
  reference_scope: string;
  official_notice: PracticeQuestion["officialNotice"];
  status: string;
  is_active: boolean;
};

type QuestionSetItemRow = {
  order_index: number;
  questions: QuestionRow | QuestionRow[] | null;
};

export async function importQuestionsAsDraft({
  filename,
  payload,
}: ImportQuestionPayload) {
  const report = validateQuestions(payload);
  if (report.summary.errorCount > 0 || !report.normalizedQuestions) {
    return {
      ok: false,
      report,
      message: "Import blocked because validation errors exist.",
    };
  }

  const supabase = getSupabaseServiceRoleClient();
  const questions = report.normalizedQuestions;
  const questionSets = buildQuestionSets(questions);
  const setSummaries = report.summary.sets;
  const setIds = setSummaries.map((set) => set.id);

  const { data: batch, error: batchError } = await supabase
    .from("import_batches")
    .insert({
      filename: filename || "uploaded-questions.json",
      total_questions: report.summary.totalQuestions,
      error_count: report.summary.errorCount,
      warning_count: report.summary.warningCount,
      status: "validated",
      set_ids: setIds,
      summary: report.summary,
    })
    .select("id")
    .single();

  if (batchError) throw new Error(`Failed to create import batch: ${batchError.message}`);

  const { error: questionsError } = await supabase.from("questions").upsert(
    questions.map((question) => ({
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
      status: "draft",
      is_active: false,
    })),
    { onConflict: "id" },
  );

  if (questionsError) throw new Error(`Failed to import questions: ${questionsError.message}`);

  const { error: setsError } = await supabase.from("question_sets").upsert(
    setSummaries.map((set) => ({
      id: set.id,
      name: getQuestionSetName(set),
      type: set.type,
      purpose: getQuestionSetPurpose(set),
      status: "draft",
      is_active: false,
    })),
    { onConflict: "id" },
  );

  if (setsError) throw new Error(`Failed to import question sets: ${setsError.message}`);

  if (setIds.length) {
    const { error: deleteItemsError } = await supabase
      .from("question_set_items")
      .delete()
      .in("set_id", setIds);

    if (deleteItemsError) {
      throw new Error(`Failed to clear set items: ${deleteItemsError.message}`);
    }
  }

  const itemPayload = Object.entries(questionSets).flatMap(([setId, setQuestions]) =>
    setQuestions.map((question, index) => ({
      set_id: setId,
      question_id: question.id,
      order_index: index,
    })),
  );

  if (itemPayload.length) {
    const { error: itemsError } = await supabase
      .from("question_set_items")
      .upsert(itemPayload, { onConflict: "set_id,question_id" });

    if (itemsError) throw new Error(`Failed to import set items: ${itemsError.message}`);
  }

  const { error: batchUpdateError } = await supabase
    .from("import_batches")
    .update({ status: "imported" })
    .eq("id", batch.id);

  if (batchUpdateError) {
    throw new Error(`Failed to update import batch: ${batchUpdateError.message}`);
  }

  return {
    ok: true,
    report,
    importResult: {
      batchId: batch.id as string,
      importedQuestionsCount: questions.length,
      importedSetsCount: setSummaries.length,
      importedSetItemsCount: itemPayload.length,
      sets: setSummaries,
    },
  };
}

export async function listInternalQuestionSets() {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("question_sets")
    .select("id, name, type, purpose, status, is_active, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to load question sets: ${error.message}`);
  return (data ?? []) as QuestionSetRow[];
}

export async function publishQuestionSet(setId: string) {
  if (!setId.trim()) {
    return { ok: false, message: "setId is required." };
  }

  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("question_set_items")
    .select(
      "order_index, questions!inner(id, section, context, difficulty, tags, question, options, answer, explanation_en, explanation_ne, source_type, reference_scope, official_notice, status, is_active)",
    )
    .eq("set_id", setId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(`Failed to load set items: ${error.message}`);
  if (!data?.length) {
    return { ok: false, message: "Cannot publish a set with no set items." };
  }

  const questions = (data as QuestionSetItemRow[])
    .map((item) => firstQuestionRow(item.questions))
    .filter((question): question is QuestionRow => Boolean(question))
    .map(mapQuestionRow);

  const report = validateQuestions(questions);
  const setIssues = validateQuestionSetComposition(setId, questions);
  const blockingIssues = [...report.errors, ...setIssues];

  if (blockingIssues.length) {
    return {
      ok: false,
      message: "Cannot publish because validation failed.",
      errors: blockingIssues,
    };
  }

  const questionIds = questions.map((question) => question.id);
  const { error: questionUpdateError } = await supabase
    .from("questions")
    .update({ status: "published", is_active: true })
    .in("id", questionIds);

  if (questionUpdateError) {
    throw new Error(`Failed to publish questions: ${questionUpdateError.message}`);
  }

  const { error: setUpdateError } = await supabase
    .from("question_sets")
    .update({ status: "published", is_active: true })
    .eq("id", setId);

  if (setUpdateError) throw new Error(`Failed to publish set: ${setUpdateError.message}`);

  return {
    ok: true,
    setId,
    publishedQuestionsCount: questionIds.length,
  };
}

function getQuestionSetName(set: QuestionSetSummary) {
  if (set.id === "levelTestSetA") return "Free Level Test Set A";
  if (set.id === "levelTestSetB") return "Free Level Test Set B";
  if (/^dailySet\d{2}$/.test(set.id)) return `Daily Practice Set ${set.id.slice(-2)}`;
  if (set.id === "marketingQuestions") return "Marketing Questions";
  if (set.id === "replacementPool") return "Replacement Pool";
  return set.id;
}

function getQuestionSetPurpose(set: QuestionSetSummary) {
  if (set.type === "level_test") return "Internal imported EPS-TOPIK level test set.";
  if (set.type === "daily_practice") return "Internal imported daily practice set.";
  if (set.type === "marketing") return "Internal imported marketing question set; not customer-facing.";
  return "Internal imported replacement question pool; not customer-facing.";
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
    options: Array.isArray(row.options)
      ? row.options.filter((option): option is string => typeof option === "string")
      : [],
    answer: row.answer,
    explanationEn: row.explanation_en,
    explanationNe: row.explanation_ne,
    sourceType: row.source_type,
    referenceScope: row.reference_scope,
    officialNotice: row.official_notice,
  };
}
