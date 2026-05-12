import { getChoiceByKey, type Question } from "@/lib/questionUtils";
import {
  trackExamEvent,
  type ExamEventName,
} from "@/lib/pageEvents";
import type {
  ChoiceKey,
  QuestionSection,
  SectionScoreKey,
} from "@/types/questions";

export type { ChoiceKey };

export type TargetIndustry =
  | "Manufacturing"
  | "Agriculture/Livestock"
  | "Construction"
  | "Service"
  | "Fishery"
  | "Other";

export type OptInLead = {
  name: string;
  contact: string;
  industry: TargetIndustry | "";
};

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type StoredResult = {
  attemptId?: string;
  answers: Record<string, ChoiceKey>;
  submittedAt: string;
  score: number;
  total: number;
};

export const USER_INFO_KEY = "k-work-daily-practice:user";
export const EXAM_ANSWERS_KEY = "k-work-daily-practice:answers";
export const EXAM_STARTED_AT_KEY = "k-work-daily-practice:exam-started-at";
export const RESULT_KEY = "k-work-daily-practice:result";
export const TEST_ATTEMPT_ID_KEY = "k-work-daily-practice:test-attempt-id";
export const TEST_ATTEMPT_PENDING_ID_KEY =
  "k-work-daily-practice:test-attempt-pending-id";
export const TEST_STARTED_TRACKED_KEY =
  "k-work-daily-practice:test-started-tracked";
export const UTM_KEY = "k-work-daily-practice:utm";

export { trackExamEvent };
export type { ExamEventName };

export type SectionScores = Record<
  SectionScoreKey,
  { correct: number; total: number }
>;

const sectionScoreKeys: Partial<Record<QuestionSection, SectionScoreKey>> = {
  Vocabulary: "vocabulary",
  Grammar: "grammar",
  Reading: "reading",
  "Workplace Korean": "workplace",
};

export const sectionLabels: Record<QuestionSection | SectionScoreKey, string> = {
  Vocabulary: "Vocabulary",
  Grammar: "Grammar",
  Reading: "Reading",
  "Workplace Korean": "Workplace Korean",
  "Mixed Review": "Mixed Review",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  reading: "Reading",
  workplace: "Workplace Korean",
};

export const difficultyLabels: Record<Question["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function getLevel(score: number) {
  if (score <= 7) return "Starting out";
  if (score <= 13) return "Building basics";
  if (score <= 17) return "Building fluency";
  return "Strong on this practice set";
}

export function getScoreTier(score: number): "low" | "mid" | "high" {
  if (score < 12) return "low";
  if (score <= 17) return "mid";
  return "high";
}

export function scoreAnswers(
  questions: Question[],
  answers: Record<string, ChoiceKey>,
) {
  return questions.reduce(
    (total, question) =>
      getChoiceByKey(question, answers[question.id]) === question.answer
        ? total + 1
        : total,
    0,
  );
}

export function getSectionScores(
  questions: Question[],
  answers: Record<string, ChoiceKey>,
) {
  return questions.reduce(
    (acc, question) => {
      const section = sectionScoreKeys[question.section];
      if (!section) return acc;

      acc[section].total += 1;

      if (getChoiceByKey(question, answers[question.id]) === question.answer) {
        acc[section].correct += 1;
      }

      return acc;
    },
    {
      vocabulary: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      workplace: { correct: 0, total: 0 },
    } satisfies SectionScores,
  );
}

export function getWeakestSection(
  sectionScores: SectionScores,
) {
  return Object.entries(sectionScores).sort(([, a], [, b]) => {
    const aRate = a.total === 0 ? 0 : a.correct / a.total;
    const bRate = b.total === 0 ? 0 : b.correct / b.total;
    return aRate - bRate;
  })[0] as [SectionScoreKey, { correct: number; total: number }];
}

export function getWeakestSections(
  sectionScores: SectionScores,
  limit = 2,
) {
  const sectionOrder: SectionScoreKey[] = [
    "vocabulary",
    "grammar",
    "reading",
    "workplace",
  ];

  return sectionOrder
    .map((section) => ({ section, ...sectionScores[section] }))
    .sort((a, b) => {
      const aRate = a.total === 0 ? 0 : a.correct / a.total;
      const bRate = b.total === 0 ? 0 : b.correct / b.total;

      if (aRate !== bRate) return aRate - bRate;
      return sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section);
    })
    .slice(0, limit);
}

export function getWeakAreaFeedback(section: SectionScoreKey) {
  const feedback: Record<SectionScoreKey, string> = {
    vocabulary:
      "Review daily words, workplace nouns, and common verbs. Small vocabulary gains can improve every section.",
    grammar:
      "Practice particles, sentence endings, and basic connectors. Focus on why each grammar form fits the sentence.",
    reading:
      "Read short notices slowly and underline time, place, reason, and rule words before choosing an answer.",
    workplace:
      "Practice safety instructions, supervisor requests, and machine or storage vocabulary used at work.",
  };

  return feedback[section];
}

export function getUtmParams(searchParams: URLSearchParams): UtmParams {
  const utm: UtmParams = {};
  const source = searchParams.get("utm_source");
  const medium = searchParams.get("utm_medium");
  const campaign = searchParams.get("utm_campaign");

  if (source) utm.utm_source = source;
  if (medium) utm.utm_medium = medium;
  if (campaign) utm.utm_campaign = campaign;

  return utm;
}

export function hasUtmParams(utm: UtmParams) {
  return Boolean(utm.utm_source || utm.utm_medium || utm.utm_campaign);
}

export function readClientUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  const currentUtm = getUtmParams(new URLSearchParams(window.location.search));
  if (hasUtmParams(currentUtm)) {
    window.localStorage.setItem(UTM_KEY, JSON.stringify(currentUtm));
    return currentUtm;
  }

  const storedUtm = window.localStorage.getItem(UTM_KEY);
  if (!storedUtm) return {};

  try {
    return JSON.parse(storedUtm) as UtmParams;
  } catch {
    return {};
  }
}
