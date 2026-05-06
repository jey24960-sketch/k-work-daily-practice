"use client";

import { getChoiceEntries, type Question } from "@/lib/questionUtils";
import { difficultyLabels, sectionLabels, type ChoiceKey } from "@/lib/exam";

type QuestionCardProps = {
  question: Question;
  questionNumber: number;
  selectedAnswer?: ChoiceKey;
  onAnswer: (answer: ChoiceKey) => void;
};

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onAnswer,
}: QuestionCardProps) {
  const imageUrl = (question as Question & { imageUrl?: string }).imageUrl;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#1e5fdc]/10 px-2.5 py-1 text-xs font-semibold text-[#1e5fdc]">
          {sectionLabels[question.section]}
        </span>
        <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
          {difficultyLabels[question.difficulty]}
        </span>
        <span className="ml-auto text-xs font-semibold text-slate-600">
          Question {questionNumber}
        </span>
      </div>

      <h2 className="text-xl font-semibold leading-8 text-slate-950 sm:text-2xl">
        {question.question}
      </h2>

      {imageUrl ? (
        <div className="mt-4 flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          Image support placeholder
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {getChoiceEntries(question).map(
          ([key, choice]) => {
            const isSelected = selectedAnswer === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onAnswer(key)}
                aria-pressed={isSelected}
                className={`flex min-h-16 w-full items-start gap-3 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40 ${
                  isSelected
                    ? "border-[#1e5fdc] bg-[#1e5fdc] text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                    isSelected
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {key}
                </span>
                <span className="pt-0.5 text-base leading-6">
                  <span>{choice}</span>
                  {isSelected ? (
                    <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-white/80">
                      Selected
                    </span>
                  ) : null}
                </span>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}
