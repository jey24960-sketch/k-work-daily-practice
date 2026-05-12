"use client";

import Image from "next/image";
import { BRAND_ICON_PATH } from "@/lib/brand";
import { Timer } from "./Timer";

type ExamHeaderProps = {
  secondsLeft: number;
  answeredCount: number;
  totalQuestions: number;
  onSubmit: () => void;
};

export function ExamHeader({
  secondsLeft,
  answeredCount,
  totalQuestions,
  onSubmit,
}: ExamHeaderProps) {
  const enoughAnswered = totalQuestions > 0 && answeredCount >= totalQuestions / 2;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[430px] items-center justify-between gap-2 px-2.5 py-2.5 sm:px-3 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src={BRAND_ICON_PATH}
            alt="K-Work Daily Practice icon"
            width={32}
            height={32}
            className="h-7 w-7 shrink-0 rounded-lg object-cover sm:h-8 sm:w-8"
          />
          <div className="min-w-0">
            <h1 className="truncate text-xs font-semibold text-slate-950 min-[360px]:text-sm sm:text-base">
              K-Work Daily Practice
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              {answeredCount}/{totalQuestions} answered
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Timer seconds={secondsLeft} />
          <button
            type="button"
            onClick={onSubmit}
            className={`min-h-10 rounded-xl px-2.5 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40 min-[360px]:text-sm sm:px-4 ${
              enoughAnswered
                ? "bg-[#1e5fdc] text-white hover:bg-[#174db8]"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </header>
  );
}
