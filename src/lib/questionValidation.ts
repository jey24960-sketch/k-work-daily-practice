import { ORIGINAL_QUESTION_NOTICE } from "../../data/questions";
import type {
  PracticeQuestion,
  QuestionDifficulty,
  QuestionSection,
} from "@/types/questions";

export type QuestionValidationIssue = {
  code: string;
  message: string;
  questionId?: string;
  setId?: string;
};

export type QuestionSetMap = Record<string, PracticeQuestion[]>;

const dangerousPhrases = [
  "official question",
  "real exam",
  "past question",
  "copied from official",
  "leaked",
  "secret",
  "guaranteed pass",
  "pass guarantee",
  "100% success",
  "HRD Korea official",
  "EPS Korea official",
  "EPS Nepal official",
];

const placeholderPattern = /\b(placeholder|tbd|todo|coming soon)\b/i;

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

export function validateQuestions(
  questions: PracticeQuestion[],
): QuestionValidationIssue[] {
  const issues: QuestionValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const question of questions) {
    if (seenIds.has(question.id)) {
      issues.push({
        code: "duplicate_id",
        message: `Duplicate question id: ${question.id}`,
        questionId: question.id,
      });
    }
    seenIds.add(question.id);

    if (question.sourceType !== "original") {
      issues.push({
        code: "non_original_source_type",
        message: "sourceType must be original.",
        questionId: question.id,
      });
    }

    if (question.officialNotice !== ORIGINAL_QUESTION_NOTICE) {
      issues.push({
        code: "non_standard_official_notice",
        message: "officialNotice must match the standardized originality notice.",
        questionId: question.id,
      });
    }

    if (!question.explanationEn.trim()) {
      issues.push({
        code: "empty_explanation_en",
        message: "explanationEn must not be empty.",
        questionId: question.id,
      });
    }

    if (!question.explanationNe.trim()) {
      issues.push({
        code: "empty_explanation_ne",
        message: "explanationNe must not be empty.",
        questionId: question.id,
      });
    }

    if (!question.referenceScope.trim()) {
      issues.push({
        code: "empty_reference_scope",
        message: "referenceScope must not be empty.",
        questionId: question.id,
      });
    }

    if (!question.question.trim()) {
      issues.push({
        code: "empty_question",
        message: "question must not be empty.",
        questionId: question.id,
      });
    }

    if (!question.answer.trim()) {
      issues.push({
        code: "empty_answer",
        message: "answer must not be empty.",
        questionId: question.id,
      });
    }

    if (question.options.length !== 4) {
      issues.push({
        code: "invalid_option_count",
        message: "Each question must have exactly four options.",
        questionId: question.id,
      });
    }

    if (question.options.some((option) => typeof option !== "string" || !option.trim())) {
      issues.push({
        code: "invalid_option_text",
        message: "Each option must be a non-empty string.",
        questionId: question.id,
      });
    }

    if (!question.options.includes(question.answer)) {
      issues.push({
        code: "answer_not_in_options",
        message: "The answer must match one of the options.",
        questionId: question.id,
      });
    }

    const searchableText = [
      question.question,
      ...question.options,
      question.answer,
      question.explanationEn,
      question.explanationNe,
      question.referenceScope,
    ].join(" ");

    if (placeholderPattern.test(searchableText)) {
      issues.push({
        code: "placeholder_text",
        message: "Question content contains placeholder/TBD/TODO/coming soon text.",
        questionId: question.id,
      });
    }

    const lowerText = searchableText.toLowerCase();
    const dangerousPhrase = dangerousPhrases.find((phrase) =>
      lowerText.includes(phrase.toLowerCase()),
    );

    if (dangerousPhrase) {
      issues.push({
        code: "dangerous_wording",
        message: `Question content contains restricted wording: ${dangerousPhrase}`,
        questionId: question.id,
      });
    }
  }

  return issues;
}

export function validateQuestionSets(
  questionSets: QuestionSetMap,
): QuestionValidationIssue[] {
  const issues: QuestionValidationIssue[] = [];

  issues.push(
    ...validateFixedSetComposition(
      "levelTestSetA",
      questionSets.levelTestSetA ?? [],
      20,
      levelTestASectionCounts,
      levelTestADifficultyCounts,
    ),
  );

  if (questionSets.levelTestSetB?.length) {
    issues.push(
      ...validateFixedSetComposition(
        "levelTestSetB",
        questionSets.levelTestSetB,
        20,
        levelTestBSectionCounts,
        levelTestBDifficultyCounts,
      ),
    );
  }

  for (const [setId, questions] of Object.entries(questionSets)) {
    if (!/^dailySet\d{2}$/.test(setId) || questions.length === 0) continue;

    issues.push(
      ...validateFixedSetComposition(
        setId,
        questions,
        5,
        dailySectionCounts,
      ),
    );
  }

  return issues;
}

export function validateQuestionSetComposition(
  setId: string,
  questions: PracticeQuestion[],
): QuestionValidationIssue[] {
  if (setId === "levelTestSetA") {
    return validateFixedSetComposition(
      setId,
      questions,
      20,
      levelTestASectionCounts,
      levelTestADifficultyCounts,
    );
  }

  if (setId === "levelTestSetB") {
    return validateFixedSetComposition(
      setId,
      questions,
      20,
      levelTestBSectionCounts,
      levelTestBDifficultyCounts,
    );
  }

  if (/^dailySet\d{2}$/.test(setId)) {
    return validateFixedSetComposition(setId, questions, 5, dailySectionCounts);
  }

  return [];
}

function validateFixedSetComposition(
  setId: string,
  questions: PracticeQuestion[],
  expectedTotal: number,
  expectedSectionCounts?: Record<QuestionSection, number>,
  expectedDifficultyCounts?: Record<QuestionDifficulty, number>,
) {
  const issues: QuestionValidationIssue[] = [];

  if (questions.length !== expectedTotal) {
    issues.push({
      code: "invalid_set_total",
      message: `${setId} must have ${expectedTotal} questions; found ${questions.length}.`,
      setId,
    });
  }

  if (expectedSectionCounts) {
    const sectionCounts = countBy(questions, "section");
    for (const [section, expectedCount] of Object.entries(
      expectedSectionCounts,
    ) as [QuestionSection, number][]) {
      if ((sectionCounts[section] ?? 0) !== expectedCount) {
        issues.push({
          code: "invalid_set_section_count",
          message: `${setId} must have ${expectedCount} ${section} questions; found ${
            sectionCounts[section] ?? 0
          }.`,
          setId,
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
        issues.push({
          code: "invalid_set_difficulty_count",
          message: `${setId} must have ${expectedCount} ${difficulty} questions; found ${
            difficultyCounts[difficulty] ?? 0
          }.`,
          setId,
        });
      }
    }
  }

  return issues;
}

function countBy<
  Key extends "section" | "difficulty",
  Value extends PracticeQuestion[Key],
>(questions: PracticeQuestion[], key: Key) {
  return questions.reduce(
    (counts, question) => {
      counts[question[key] as Value] = (counts[question[key] as Value] ?? 0) + 1;
      return counts;
    },
    {} as Partial<Record<Value, number>>,
  );
}
