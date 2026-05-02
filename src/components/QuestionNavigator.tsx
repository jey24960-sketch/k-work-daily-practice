"use client";

import type { Question } from "../../data/questions";
import type { ChoiceKey } from "@/lib/exam";

type QuestionNavigatorProps = {
  questions: Question[];
  answers: Record<number, ChoiceKey>;
  currentIndex: number;
  onSelect: (index: number) => void;
};

export function QuestionNavigator({
  questions,
  answers,
  currentIndex,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <nav
      className="grid grid-cols-10 gap-1.5 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-[repeat(20,minmax(0,1fr))] sm:gap-2 sm:p-3"
      aria-label="Question navigation"
    >
      {questions.map((question, index) => {
        const isCurrent = index === currentIndex;
        const isAnswered = Boolean(answers[question.id]);

        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`flex h-8 min-w-0 items-center justify-center rounded-md border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-400 sm:aspect-square sm:h-auto sm:text-sm ${
              isCurrent
                ? "border-slate-950 bg-slate-950 text-white"
                : isAnswered
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
            }`}
            aria-current={isCurrent ? "step" : undefined}
          >
            {index + 1}
          </button>
        );
      })}
    </nav>
  );
}
