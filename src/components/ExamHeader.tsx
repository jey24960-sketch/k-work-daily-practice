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
      <div className="mx-auto flex max-w-[430px] items-center justify-between gap-2 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src={BRAND_ICON_PATH}
            alt="K-Work Daily Practice icon"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              EPS-TOPIK Level Test
            </p>
            <h1 className="truncate text-sm font-semibold text-slate-950 sm:text-base">
              K-Work Daily Practice
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Timer seconds={secondsLeft} />
          <button
            type="button"
            onClick={onSubmit}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40 sm:px-4 ${
              enoughAnswered
                ? "bg-[#1e5fdc] text-white hover:bg-[#174db8]"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Submit test
          </button>
        </div>
      </div>
    </header>
  );
}
