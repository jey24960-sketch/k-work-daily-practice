import { ORIGINAL_QUESTION_NOTICE } from "../../data/questions";
import type {
  PracticeQuestion,
  QuestionDifficulty,
  QuestionSection,
} from "@/types/questions";

export type ValidationSeverity = "error" | "warning";

export type QuestionValidationIssue = {
  code: string;
  message: string;
  questionId?: string;
  setId?: string;
  field?: string;
  severity: ValidationSeverity;
};

export type QuestionSetSummary = {
  id: string;
  type: "level_test" | "daily_practice" | "marketing" | "replacement";
  questionCount: number;
  sections: Record<string, number>;
  difficulties: Record<string, number>;
};

export type QuestionValidationReport = {
  summary: {
    totalQuestions: number;
    errorCount: number;
    warningCount: number;
    sets: QuestionSetSummary[];
    sections: Record<string, number>;
    difficulties: Record<string, number>;
  };
  errors: Array<QuestionValidationIssue & { severity: "error" }>;
  warnings: Array<QuestionValidationIssue & { severity: "warning" }>;
  normalizedQuestions?: PracticeQuestion[];
};

export type QuestionSetMap = Record<string, PracticeQuestion[]>;

const allowedSections: QuestionSection[] = [
  "Vocabulary",
  "Grammar",
  "Reading",
  "Workplace Korean",
  "Mixed Review",
];

const allowedDifficulties: QuestionDifficulty[] = ["easy", "medium", "hard"];

const bannedPhrases = [
  "real exam",
  "past question",
  "official question",
  "official EPS question",
  "official EPS-TOPIK question",
  "copied from official",
  "leaked",
  "secret question",
  "guaranteed pass",
  "pass guarantee",
  "100% success",
  "HRD Korea official",
  "EPS Korea official",
  "EPS Nepal official",
];

const placeholderPhrases = [
  "placeholder",
  "TBD",
  "TODO",
  "coming soon",
  "Nepali explanation coming soon",
  "to be added",
  "fill later",
];

const levelTestASectionCounts: Record<QuestionSection, number> = {
  Vocabulary: 5,
  Grammar: 5,
  Reading: 5,
  "Workplace Korean": 5,
  "Mixed Review": 0,
};

const levelTestADifficultyCounts: Record<QuestionDifficulty, number> = {
  easy: 8,
  medium: 10,
  hard: 2,
};

const levelTestBSectionCounts: Record<QuestionSection, number> = {
  Vocabulary: 5,
  Grammar: 5,
  Reading: 5,
  "Workplace Korean": 5,
  "Mixed Review": 0,
};

const levelTestBDifficultyCounts: Record<QuestionDifficulty, number> = {
  easy: 7,
  medium: 11,
  hard: 2,
};

const dailySectionCounts: Record<QuestionSection, number> = {
  Vocabulary: 1,
  Grammar: 1,
  Reading: 1,
  "Workplace Korean": 1,
  "Mixed Review": 1,
};

export function validateQuestions(input: unknown): QuestionValidationReport {
  const { questions, inputErrors } = normalizeQuestionInput(input);
  const errors: Array<QuestionValidationIssue & { severity: "error" }> = [
    ...inputErrors,
  ];
  const warnings: Array<QuestionValidationIssue & { severity: "warning" }> = [];

  validateQuestionList(questions, errors, warnings);

  const questionSets = buildQuestionSets(questions);
  validateQuestionSets(questionSets, errors, warnings);

  const summary = buildSummary(questions, questionSets, errors, warnings);

  return {
    summary,
    errors,
    warnings,
    normalizedQuestions: questions,
  };
}

export function validateQuestionIssues(
  questions: PracticeQuestion[],
): QuestionValidationIssue[] {
  const report = validateQuestions(questions);
  return report.errors;
}

export function validateQuestionSets(
  questionSets: QuestionSetMap,
  errors: Array<QuestionValidationIssue & { severity: "error" }> = [],
  warnings: Array<QuestionValidationIssue & { severity: "warning" }> = [],
): QuestionValidationIssue[] {
  if (questionSets.levelTestSetA?.length) {
    validateFixedSetComposition(
      "levelTestSetA",
      questionSets.levelTestSetA,
      20,
      levelTestASectionCounts,
      levelTestADifficultyCounts,
      errors,
    );
  }

  if (questionSets.levelTestSetB?.length) {
    validateFixedSetComposition(
      "levelTestSetB",
      questionSets.levelTestSetB,
      20,
      levelTestBSectionCounts,
      levelTestBDifficultyCounts,
      errors,
    );
  }

  for (const [setId, questions] of Object.entries(questionSets)) {
    if (!/^dailySet\d{2}$/.test(setId) || questions.length === 0) continue;

    validateFixedSetComposition(
      setId,
      questions,
      5,
      dailySectionCounts,
      undefined,
      errors,
    );
  }

  for (const [setId, questions] of Object.entries(questionSets)) {
    if (
      questions.length > 0 &&
      (setId === "marketingQuestions" || setId === "replacementPool")
    ) {
      warnings.push({
        code: "unused_non_customer_set",
        message: `${setId} is importable but is not used by the customer-facing app yet.`,
        setId,
        severity: "warning",
      });
    }
  }

  return [...errors, ...warnings];
}

export function validateQuestionSetComposition(
  setId: string,
  questions: PracticeQuestion[],
): QuestionValidationIssue[] {
  const errors: Array<QuestionValidationIssue & { severity: "error" }> = [];

  if (setId === "levelTestSetA") {
    validateFixedSetComposition(
      setId,
      questions,
      20,
      levelTestASectionCounts,
      levelTestADifficultyCounts,
      errors,
    );
  } else if (setId === "levelTestSetB") {
    validateFixedSetComposition(
      setId,
      questions,
      20,
      levelTestBSectionCounts,
      levelTestBDifficultyCounts,
      errors,
    );
  } else if (/^dailySet\d{2}$/.test(setId)) {
    validateFixedSetComposition(
      setId,
      questions,
      5,
      dailySectionCounts,
      undefined,
      errors,
    );
  }

  return errors;
}

export function buildQuestionSets(
  questions: PracticeQuestion[],
): QuestionSetMap {
  const sets: QuestionSetMap = {};

  for (const question of questions) {
    for (const setId of question.usage.levelTestSets) {
      addQuestionToSet(sets, setId, question);
    }

    for (const setId of question.usage.dailyPracticeSets) {
      addQuestionToSet(sets, setId, question);
    }

    if (question.usage.marketing) {
      addQuestionToSet(sets, "marketingQuestions", question);
    }

    if (question.usage.replacementPool) {
      addQuestionToSet(sets, "replacementPool", question);
    }
  }

  return sets;
}

function validateQuestionList(
  questions: PracticeQuestion[],
  errors: Array<QuestionValidationIssue & { severity: "error" }>,
  warnings: Array<QuestionValidationIssue & { severity: "warning" }>,
) {
  const seenIds = new Set<string>();
  const seenQuestionText = new Map<string, string>();

  questions.forEach((question, index) => {
    const fallbackId = question.id || `index:${index}`;

    if (!question.id.trim()) {
      errors.push(error("missing_id", "id is required.", fallbackId, undefined, "id"));
    } else if (seenIds.has(question.id)) {
      errors.push(
        error(
          "duplicate_id",
          `Duplicate question id: ${question.id}`,
          question.id,
          undefined,
          "id",
        ),
      );
    }
    seenIds.add(question.id);

    if (!allowedSections.includes(question.section)) {
      errors.push(
        error(
          "invalid_section",
          `section must be one of: ${allowedSections.join(", ")}.`,
          fallbackId,
          undefined,
          "section",
        ),
      );
    }

    if (!allowedDifficulties.includes(question.difficulty)) {
      errors.push(
        error(
          "invalid_difficulty",
          "difficulty must be easy, medium, or hard.",
          fallbackId,
          undefined,
          "difficulty",
        ),
      );
    }

    if (!Array.isArray(question.options)) {
      errors.push(error("missing_options", "options must exist.", fallbackId, undefined, "options"));
    } else if (question.options.length !== 4) {
      errors.push(
        error(
          "invalid_option_count",
          "options must contain exactly 4 strings.",
          fallbackId,
          undefined,
          "options",
        ),
      );
    }

    if (
      question.options.some(
        (option) => typeof option !== "string" || !option.trim(),
      )
    ) {
      errors.push(
        error(
          "invalid_option_text",
          "every option must be a non-empty string.",
          fallbackId,
          undefined,
          "options",
        ),
      );
    }

    const normalizedOptions = question.options.map((option) => option.trim());
    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      errors.push(
        error(
          "duplicate_options",
          "options must not contain duplicates.",
          fallbackId,
          undefined,
          "options",
        ),
      );
    }

    if (!question.options.includes(question.answer)) {
      errors.push(
        error(
          "answer_not_in_options",
          "answer must exactly match one option.",
          fallbackId,
          undefined,
          "answer",
        ),
      );
    }

    for (const [field, value] of Object.entries({
      question: question.question,
      answer: question.answer,
      explanationEn: question.explanationEn,
      explanationNe: question.explanationNe,
      referenceScope: question.referenceScope,
    })) {
      if (!value.trim()) {
        errors.push(
          error(
            `empty_${toSnakeCase(field)}`,
            `${field} must not be empty.`,
            fallbackId,
            undefined,
            field,
          ),
        );
      }
    }

    if (question.sourceType !== "original") {
      errors.push(
        error(
          "non_original_source_type",
          "sourceType must be original.",
          fallbackId,
          undefined,
          "sourceType",
        ),
      );
    }

    if (question.officialNotice !== ORIGINAL_QUESTION_NOTICE) {
      errors.push(
        error(
          "non_standard_official_notice",
          "officialNotice must match the standardized originality notice.",
          fallbackId,
          undefined,
          "officialNotice",
        ),
      );
    }

    const searchableText = [
      question.question,
      ...question.options,
      question.answer,
      question.explanationEn,
      question.explanationNe,
      question.referenceScope,
    ].join(" ");

    const bannedPhrase = bannedPhrases.find((phrase) =>
      includesPhrase(searchableText, phrase),
    );
    if (bannedPhrase) {
      errors.push(
        error(
          "banned_phrase",
          `Content contains banned phrase: ${bannedPhrase}`,
          fallbackId,
        ),
      );
    }

    const placeholderPhrase = placeholderPhrases.find((phrase) =>
      includesPhrase(searchableText, phrase),
    );
    if (placeholderPhrase) {
      errors.push(
        error(
          "placeholder_phrase",
          `Content contains placeholder phrase: ${placeholderPhrase}`,
          fallbackId,
        ),
      );
    }

    if (question.question.length > 400) {
      warnings.push(
        warning(
          "long_question_text",
          "Question text is very long; check mobile readability.",
          fallbackId,
          undefined,
          "question",
        ),
      );
    }

    if (question.explanationEn.length > 600 || question.explanationNe.length > 600) {
      warnings.push(
        warning(
          "long_explanation",
          "Explanation is very long; check answer review readability.",
          fallbackId,
        ),
      );
    }

    if (new Set(question.tags).size !== question.tags.length) {
      warnings.push(
        warning(
          "repeated_tags",
          "Repeated tags were found.",
          fallbackId,
          undefined,
          "tags",
        ),
      );
    }

    if (!question.context.trim()) {
      warnings.push(
        warning(
          "missing_context_detail",
          "context is empty; add a short content scope if available.",
          fallbackId,
          undefined,
          "context",
        ),
      );
    }

    const normalizedQuestionText = normalizeComparableText(question.question);
    const duplicateLikeId = seenQuestionText.get(normalizedQuestionText);
    if (normalizedQuestionText && duplicateLikeId && duplicateLikeId !== question.id) {
      warnings.push(
        warning(
          "duplicate_like_question_text",
          `Question text is very similar to ${duplicateLikeId}.`,
          fallbackId,
          undefined,
          "question",
        ),
      );
    } else if (normalizedQuestionText) {
      seenQuestionText.set(normalizedQuestionText, question.id);
    }
  });
}

function normalizeQuestionInput(input: unknown): {
  questions: PracticeQuestion[];
  inputErrors: Array<QuestionValidationIssue & { severity: "error" }>;
} {
  const inputErrors: Array<QuestionValidationIssue & { severity: "error" }> = [];
  const rawQuestions: unknown[] = [];

  if (Array.isArray(input)) {
    rawQuestions.push(...input);
  } else if (isRecord(input)) {
    if (Array.isArray(input.questions)) {
      rawQuestions.push(...input.questions);
    }

    appendNamedQuestions(rawQuestions, input, "levelTestSetAQuestions", {
      levelTestSets: ["levelTestSetA"],
    });
    appendNamedQuestions(rawQuestions, input, "levelTestSetBQuestions", {
      levelTestSets: ["levelTestSetB"],
    });
    appendNamedQuestions(rawQuestions, input, "dailyPracticeQuestions", {});
    appendNamedQuestions(rawQuestions, input, "marketingQuestions", {
      marketing: true,
    });
    appendNamedQuestions(rawQuestions, input, "replacementPoolQuestions", {
      replacementPool: true,
    });
  } else {
    inputErrors.push({
      code: "invalid_input_shape",
      message: "Upload must be an array, an object with questions, or named question arrays.",
      severity: "error",
    });
  }

  const questions = rawQuestions.flatMap((rawQuestion, index) => {
    const normalized = normalizePracticeQuestion(rawQuestion);
    if (!normalized) {
      inputErrors.push({
        code: "invalid_question_shape",
        message: `Question at index ${index} is not an object.`,
        severity: "error",
      });
      return [];
    }
    return [normalized];
  });

  return { questions, inputErrors };
}

function appendNamedQuestions(
  output: unknown[],
  input: Record<string, unknown>,
  field: string,
  usageDefaults: Partial<PracticeQuestion["usage"]>,
) {
  const value = input[field];
  if (!Array.isArray(value)) return;

  for (const item of value) {
    if (!isRecord(item)) {
      output.push(item);
      continue;
    }

    const usage = isRecord(item.usage) ? item.usage : {};
    output.push({
      ...item,
      usage: {
        ...usageDefaults,
        ...usage,
      },
    });
  }
}

function normalizePracticeQuestion(rawQuestion: unknown): PracticeQuestion | null {
  if (!isRecord(rawQuestion)) return null;
  const usage = isRecord(rawQuestion.usage) ? rawQuestion.usage : {};

  return {
    id: stringValue(rawQuestion.id),
    section: stringValue(rawQuestion.section) as QuestionSection,
    context: stringValue(rawQuestion.context),
    difficulty: stringValue(rawQuestion.difficulty) as QuestionDifficulty,
    tags: Array.isArray(rawQuestion.tags)
      ? rawQuestion.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    usage: {
      levelTestSets: stringArrayValue(usage.levelTestSets),
      dailyPracticeSets: stringArrayValue(usage.dailyPracticeSets),
      marketing: Boolean(usage.marketing),
      replacementPool: Boolean(usage.replacementPool),
      isActive: Boolean(usage.isActive),
    },
    question: stringValue(rawQuestion.question),
    options: Array.isArray(rawQuestion.options)
      ? rawQuestion.options.filter(
          (option): option is string => typeof option === "string",
        )
      : [],
    answer: stringValue(rawQuestion.answer),
    explanationEn: stringValue(rawQuestion.explanationEn),
    explanationNe: stringValue(rawQuestion.explanationNe),
    sourceType: stringValue(rawQuestion.sourceType) as "original",
    referenceScope: stringValue(rawQuestion.referenceScope),
    officialNotice: stringValue(rawQuestion.officialNotice) as PracticeQuestion["officialNotice"],
  };
}

function validateFixedSetComposition(
  setId: string,
  questions: PracticeQuestion[],
  expectedTotal: number,
  expectedSectionCounts: Record<QuestionSection, number> | undefined,
  expectedDifficultyCounts:
    | Record<QuestionDifficulty, number>
    | undefined,
  errors: Array<QuestionValidationIssue & { severity: "error" }>,
) {
  if (questions.length !== expectedTotal) {
    errors.push({
      code: "invalid_set_total",
      message: `${setId} must have ${expectedTotal} questions; found ${questions.length}.`,
      setId,
      severity: "error",
    });
  }

  if (expectedSectionCounts) {
    const sectionCounts = countBy(questions, "section");
    for (const [section, expectedCount] of Object.entries(
      expectedSectionCounts,
    ) as [QuestionSection, number][]) {
      if ((sectionCounts[section] ?? 0) !== expectedCount) {
        errors.push({
          code: "invalid_set_section_count",
          message: `${setId} must have ${expectedCount} ${section} questions; found ${
            sectionCounts[section] ?? 0
          }.`,
          setId,
          field: "section",
          severity: "error",
        });
      }
    }
  }

  if (expectedDifficultyCounts) {
    const difficultyCounts = countBy(questions, "difficulty");
    for (const [difficulty, expectedCount] of Object.entries(
      expectedDifficultyCounts,
    ) as [QuestionDifficulty, number][]) {
      if ((difficultyCounts[difficulty] ?? 0) !== expectedCount) {
        errors.push({
          code: "invalid_set_difficulty_count",
          message: `${setId} must have ${expectedCount} ${difficulty} questions; found ${
            difficultyCounts[difficulty] ?? 0
          }.`,
          setId,
          field: "difficulty",
          severity: "error",
        });
      }
    }
  }
}

function buildSummary(
  questions: PracticeQuestion[],
  questionSets: QuestionSetMap,
  errors: QuestionValidationIssue[],
  warnings: QuestionValidationIssue[],
): QuestionValidationReport["summary"] {
  return {
    totalQuestions: questions.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    sets: Object.entries(questionSets).map(([id, setQuestions]) => ({
      id,
      type: getQuestionSetType(id),
      questionCount: setQuestions.length,
      sections: countBy(setQuestions, "section"),
      difficulties: countBy(setQuestions, "difficulty"),
    })),
    sections: countBy(questions, "section"),
    difficulties: countBy(questions, "difficulty"),
  };
}

function addQuestionToSet(
  sets: QuestionSetMap,
  setId: string,
  question: PracticeQuestion,
) {
  sets[setId] = sets[setId] ?? [];
  sets[setId].push(question);
}

function getQuestionSetType(
  setId: string,
): QuestionSetSummary["type"] {
  if (/^dailySet\d{2}$/.test(setId)) return "daily_practice";
  if (setId === "marketingQuestions") return "marketing";
  if (setId === "replacementPool") return "replacement";
  return "level_test";
}

function countBy<
  Key extends "section" | "difficulty",
  Value extends PracticeQuestion[Key],
>(questions: PracticeQuestion[], key: Key) {
  return questions.reduce(
    (counts, question) => {
      const value = question[key] as Value;
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    },
    {} as Record<Value, number>,
  );
}

function error(
  code: string,
  message: string,
  questionId?: string,
  setId?: string,
  field?: string,
): QuestionValidationIssue & { severity: "error" } {
  return { code, message, questionId, setId, field, severity: "error" };
}

function warning(
  code: string,
  message: string,
  questionId?: string,
  setId?: string,
  field?: string,
): QuestionValidationIssue & { severity: "warning" } {
  return { code, message, questionId, setId, field, severity: "warning" };
}

function includesPhrase(text: string, phrase: string) {
  return text.toLowerCase().includes(phrase.toLowerCase());
}

function normalizeComparableText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function toSnakeCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringArrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
