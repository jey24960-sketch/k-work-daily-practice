import type { Question } from "../../data/questions";

export type ChoiceKey = keyof Question["choices"];

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
  industry: TargetIndustry;
};

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

export type StoredResult = {
  attemptId?: string;
  answers: Record<number, ChoiceKey>;
  submittedAt: string;
  score: number;
  total: number;
};

export const USER_INFO_KEY = "k-work-daily-practice:user";
export const EXAM_ANSWERS_KEY = "k-work-daily-practice:answers";
export const RESULT_KEY = "k-work-daily-practice:result";
export const TEST_ATTEMPT_ID_KEY = "k-work-daily-practice:test-attempt-id";
export const TEST_ATTEMPT_PENDING_ID_KEY =
  "k-work-daily-practice:test-attempt-pending-id";
export const UTM_KEY = "k-work-daily-practice:utm";

export type ExamEventName =
  | "test_started"
  | "question_answered"
  | "test_submitted"
  | "result_viewed"
  | "retake_clicked";

export function trackExamEvent(
  eventName: ExamEventName,
  metadata: Record<string, string | number | boolean> = {},
) {
  void eventName;
  void metadata;
}

export const sectionLabels: Record<Question["section"], string> = {
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
  if (score <= 7) return "Beginner";
  if (score <= 13) return "Developing";
  if (score <= 17) return "Near Exam Ready";
  return "Strong";
}

export function scoreAnswers(
  questions: Question[],
  answers: Record<number, ChoiceKey>,
) {
  return questions.reduce(
    (total, question) =>
      answers[question.id] === question.correctAnswer ? total + 1 : total,
    0,
  );
}

export function getSectionScores(
  questions: Question[],
  answers: Record<number, ChoiceKey>,
) {
  return questions.reduce(
    (acc, question) => {
      const section = question.section;
      acc[section].total += 1;

      if (answers[question.id] === question.correctAnswer) {
        acc[section].correct += 1;
      }

      return acc;
    },
    {
      vocabulary: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      workplace: { correct: 0, total: 0 },
    } satisfies Record<Question["section"], { correct: number; total: number }>,
  );
}

export function getWeakestSection(
  sectionScores: Record<Question["section"], { correct: number; total: number }>,
) {
  return Object.entries(sectionScores).sort(([, a], [, b]) => {
    const aRate = a.total === 0 ? 0 : a.correct / a.total;
    const bRate = b.total === 0 ? 0 : b.correct / b.total;
    return aRate - bRate;
  })[0] as [Question["section"], { correct: number; total: number }];
}

export function getWeakestSections(
  sectionScores: Record<Question["section"], { correct: number; total: number }>,
  limit = 2,
) {
  const sectionOrder: Question["section"][] = [
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

export function getWeakAreaFeedback(section: Question["section"]) {
  const feedback: Record<Question["section"], string> = {
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
