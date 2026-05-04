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
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
        <span>Question map</span>
        <span className="text-right">Answered questions are marked</span>
      </div>
      <nav
        className="grid grid-cols-5 gap-2 sm:grid-cols-10"
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
              className={`flex h-11 min-w-0 items-center justify-center rounded-md border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                isCurrent
                  ? "border-slate-950 bg-slate-950 text-white"
                  : isAnswered
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
              }`}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Question ${index + 1}${
                isAnswered ? ", answered" : ", not answered"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </nav>
    </section>
  );
}
