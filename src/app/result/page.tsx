"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { questions } from "../../../data/questions";
import { AnswerReview } from "@/components/AnswerReview";
import { ResultSummary } from "@/components/ResultSummary";
import { SectionBreakdown } from "@/components/SectionBreakdown";
import {
  EXAM_ANSWERS_KEY,
  RESULT_KEY,
  getSectionScores,
  getWeakestSection,
  sectionLabels,
  type StoredResult,
} from "@/lib/exam";

export default function ResultPage() {
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    const storedResult = window.localStorage.getItem(RESULT_KEY);
    if (storedResult) {
      queueMicrotask(() =>
        setResult(JSON.parse(storedResult) as StoredResult),
      );
    }
  }, []);

  const sectionScores = useMemo(() => {
    if (!result) return null;
    return getSectionScores(questions, result.answers);
  }, [result]);

  const weakest = sectionScores ? getWeakestSection(sectionScores) : null;

  function handleRetake() {
    window.localStorage.removeItem(RESULT_KEY);
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
  }

  if (!result || !sectionScores || !weakest) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 text-slate-950">
        <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
          <h1 className="text-xl font-semibold">No result found</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Take the free level test to see your score and answer review.
          </p>
          <Link
            href="/test"
            className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Start Free Test
          </Link>
        </section>
      </main>
    );
  }

  const [weakSection, weakScore] = weakest;

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Free Level Test 01
          </p>
          <h1 className="mt-2 text-3xl font-bold">Your Result</h1>
          {result.user ? (
            <p className="mt-2 text-sm text-slate-600">
              {result.user.name} · {result.user.industry}
            </p>
          ) : null}
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ResultSummary score={result.score} total={result.total} />
          <SectionBreakdown scores={sectionScores} />
        </div>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Weak Area Summary</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your lowest section is{" "}
            <span className="font-semibold text-slate-950">
              {sectionLabels[weakSection]}
            </span>{" "}
            ({weakScore.correct}/{weakScore.total}). Review these questions first
            and practice similar patterns before taking another mock test.
          </p>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/test"
            onClick={handleRetake}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Retake Test
          </Link>
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-6">
          <AnswerReview questions={questions} answers={result.answers} />
        </div>
      </div>
    </main>
  );
}
