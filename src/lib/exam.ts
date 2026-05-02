import type { Question } from "../../data/questions";

export type ChoiceKey = keyof Question["choices"];

export type TargetIndustry = "Manufacturing" | "Agriculture" | "Other";

export type TestUser = {
  name: string;
  contact: string;
  industry: TargetIndustry;
};

export type StoredResult = {
  user: TestUser | null;
  answers: Record<number, ChoiceKey>;
  submittedAt: string;
  score: number;
  total: number;
};

export const USER_INFO_KEY = "eps-practice-nepal:user";
export const EXAM_ANSWERS_KEY = "eps-practice-nepal:answers";
export const RESULT_KEY = "eps-practice-nepal:result";

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
