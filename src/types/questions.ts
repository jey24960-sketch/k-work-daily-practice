export type QuestionSection =
  | "Vocabulary"
  | "Grammar"
  | "Reading"
  | "Workplace Korean"
  | "Mixed Review";

export type SectionScoreKey =
  | "vocabulary"
  | "grammar"
  | "reading"
  | "workplace";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuestionSourceType = "original";

export type ChoiceKey = "A" | "B" | "C" | "D";

export type OfficialNotice =
  "This is an original practice question. It is not an official EPS-TOPIK question and is not copied from any official textbook or past exam.";

export type QuestionUsage = {
  levelTestSets: string[];
  dailyPracticeSets: string[];
  marketing: boolean;
  replacementPool: boolean;
  isActive: boolean;
};

export type PracticeQuestion = {
  id: string;
  section: QuestionSection;
  context: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  usage: QuestionUsage;
  question: string;
  options: string[];
  answer: string;
  explanationEn: string;
  explanationNe: string;
  sourceType: QuestionSourceType;
  referenceScope: string;
  officialNotice: OfficialNotice;
};
