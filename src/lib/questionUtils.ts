import type { ChoiceKey, PracticeQuestion } from "@/types/questions";

export type Question = PracticeQuestion;

export function getChoiceEntries(question: Question): [ChoiceKey, string][] {
  return question.options.map((option, index) => [
    ["A", "B", "C", "D"][index] as ChoiceKey,
    option,
  ]);
}

export function getChoiceByKey(question: Question, key?: ChoiceKey) {
  if (!key) return undefined;
  return question.options[["A", "B", "C", "D"].indexOf(key)];
}

export function getCorrectChoiceKey(question: Question) {
  return getChoiceEntries(question).find(
    ([, option]) => option === question.answer,
  )?.[0];
}
