"use client";

import type { Question } from "@/lib/questionUtils";
import type { ChoiceKey } from "@/lib/exam";

type QuestionNavigatorProps = {
  questions: Question[];
  answers: Record<string, ChoiceKey>;
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
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
        <span>Question map</span>
        <span className="text-right">Answered questions are marked</span>
      </div>
      <p className="mb-3 text-xs leading-5 text-slate-500">
        You can tap a question number to review it.
        <br />
        प्रश्न नम्बर थिचेर फेरि हेर्न सक्नुहुन्छ।
      </p>
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
              className={`flex h-11 min-w-0 items-center justify-center rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40 ${
                isCurrent
                  ? "border-[#1e5fdc] bg-[#1e5fdc] text-white"
                  : isAnswered
                    ? "border-[#1e5fdc]/25 bg-[#1e5fdc]/10 text-[#1e5fdc]"
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
