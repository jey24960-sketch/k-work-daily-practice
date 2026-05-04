"use client";

import { Timer } from "./Timer";

type ExamHeaderProps = {
  secondsLeft: number;
  onSubmit: () => void;
};

export function ExamHeader({ secondsLeft, onSubmit }: ExamHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Free Level Test 01
          </p>
          <h1 className="truncate text-sm font-semibold text-slate-950 sm:text-base">
            K-Work Tayari
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Timer seconds={secondsLeft} />
          <button
            type="button"
            onClick={onSubmit}
            className="min-h-11 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:px-4"
          >
            Submit test
          </button>
        </div>
      </div>
    </header>
  );
}
