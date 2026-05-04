"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  dailyQuestions,
  type DailyQuestion,
} from "../../../data/dailyQuestions";

type ChoiceKey = DailyQuestion["correctAnswer"];
type DailyStage = "intro" | "practice" | "result";

const sectionLabels: Record<DailyQuestion["section"], string> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  reading: "Reading",
  workplace: "Workplace Korean",
  mixed: "Mixed Review",
};

const difficultyLabels: Record<DailyQuestion["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default function DailyPracticePage() {
  const [stage, setStage] = useState<DailyStage>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ChoiceKey>>({});
  const [shareStatus, setShareStatus] = useState("");

  const currentQuestion = dailyQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === dailyQuestions.length;

  const score = useMemo(
    () =>
      dailyQuestions.reduce(
        (total, question) =>
          answers[question.id] === question.correctAnswer ? total + 1 : total,
        0,
      ),
    [answers],
  );

  const sectionScores = useMemo(() => getSectionScores(answers), [answers]);
  const weakSection = useMemo(
    () => getWeakSection(sectionScores),
    [sectionScores],
  );

  function handleStart() {
    setStage("practice");
    setCurrentIndex(0);
    setAnswers({});
    setShareStatus("");
  }

  function handleAnswer(answer: ChoiceKey) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: answer,
    }));
  }

  function handleNext() {
    if (currentIndex < dailyQuestions.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    if (allAnswered) {
      setStage("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleShare() {
    const url =
      typeof window === "undefined" ? "" : `${window.location.origin}/daily`;
    const text = `I scored ${score}/5 on K-Work Tayari 5-Minute EPS-TOPIK Practice. Try it here: ${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "K-Work Tayari 5-Minute EPS-TOPIK Practice",
          text,
          url,
        });
        setShareStatus("Share sheet opened.");
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShareStatus("Practice score copied.");
        return;
      }

      setShareStatus("Copy is not available. Use the WhatsApp button below.");
    } catch {
      setShareStatus("Sharing was cancelled or could not be completed.");
    }
  }

  if (stage === "intro") {
    return (
      <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Secondary practice
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight">
            Today&rsquo;s 5-Minute Practice
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            A short EPS-TOPIK practice set for repeat visits. For a full
            diagnostic, start with the 20-question level test.
          </p>

          <section className="mt-6 grid gap-3 sm:grid-cols-4">
            {["5 questions", "2-4 minutes", "Instant result", "No login"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-slate-700">
                    {item}
                  </p>
                </div>
              ),
            )}
          </section>

          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">What is included?</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {dailyQuestions.map((question) => (
                <span
                  key={question.id}
                  className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {sectionLabels[question.section]}
                </span>
              ))}
            </div>
          </section>

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="min-h-14 w-full rounded-md bg-slate-950 px-5 py-4 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Start 5-Minute Practice
            </button>
            <Link
              href="/test"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Start Free 20-Question Test
            </Link>
          </div>

          <footer className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-sm leading-6 text-slate-500">
              K-Work Tayari is an independent practice service. It is not
              affiliated with HRD Korea, EPS Korea, EPS Nepal, or any
              government agency.
            </p>
          </footer>
        </div>
      </main>
    );
  }

  if (stage === "practice") {
    const selectedAnswer = answers[currentQuestion.id];
    const progressPercent = Math.round(
      ((currentIndex + 1) / dailyQuestions.length) * 100,
    );

    return (
      <main className="min-h-dvh bg-slate-50 text-slate-950">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  5-Minute Practice
                </p>
                <h1 className="text-sm font-semibold">
                  Question {currentIndex + 1} of {dailyQuestions.length}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setStage("intro")}
                className="min-h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Exit
              </button>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-5">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {sectionLabels[currentQuestion.section]}
              </span>
              <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
                {difficultyLabels[currentQuestion.difficulty]}
              </span>
            </div>
            <h2 className="text-xl font-semibold leading-8 text-slate-950">
              {currentQuestion.prompt}
            </h2>

            <div className="mt-6 space-y-3">
              {(Object.entries(currentQuestion.choices) as [
                ChoiceKey,
                string,
              ][]).map(([key, choice]) => {
                const isSelected = selectedAnswer === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleAnswer(key)}
                    aria-pressed={isSelected}
                    className={`flex min-h-16 w-full items-start gap-3 rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white"
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
              })}
            </div>
          </section>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              disabled={currentIndex === 0}
              className="min-h-12 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedAnswer || (currentIndex === 4 && !allAnswered)}
              className="min-h-12 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {currentIndex === dailyQuestions.length - 1
                ? "Submit Practice"
                : "Next"}
            </button>
          </div>
          {currentIndex === dailyQuestions.length - 1 && !allAnswered ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Answer all 5 questions before submitting.
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/daily`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `I scored ${score}/5 on K-Work Tayari 5-Minute EPS-TOPIK Practice. Try it here: ${shareUrl}`,
  )}`;

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            5-Minute Practice Result
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            You scored {score}/5
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {weakSection
              ? `You may need more practice with ${sectionLabels[weakSection]}.`
              : "Strong practice result. Keep going with the full level test."}
          </p>
        </header>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Section mini-breakdown</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(sectionScores).map(([section, scoreRow]) => (
              <div
                key={section}
                className="rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {sectionLabels[section as DailyQuestion["section"]]}
                  </span>
                  <span className="font-semibold text-slate-950">
                    {scoreRow.correct}/{scoreRow.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Next steps</h2>
          <div className="mt-4 grid gap-3">
            <Link
              href="/test"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Take the Full 20-Question Level Test
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Share My Practice Score
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              Share on WhatsApp
            </a>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Try Again
            </button>
          </div>
          {shareStatus ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {shareStatus}
            </p>
          ) : null}
        </section>

        <DailyReview questions={dailyQuestions} answers={answers} />

        <footer className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-sm leading-6 text-slate-500">
            K-Work Tayari is an independent practice service. It is not
            affiliated with HRD Korea, EPS Korea, EPS Nepal, or any government
            agency.
          </p>
        </footer>
      </div>
    </main>
  );
}

function DailyReview({
  questions,
  answers,
}: {
  questions: DailyQuestion[];
  answers: Record<string, ChoiceKey>;
}) {
  return (
    <section className="mt-6 space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          Review answers
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Read the explanation and then try the full level test.
        </p>
      </div>
      {questions.map((question, index) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;

        return (
          <article
            key={question.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-3 sm:flex sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Question {index + 1} - {sectionLabels[question.section]}
                </p>
                <h3 className="mt-1 font-semibold leading-7 text-slate-950">
                  {question.prompt}
                </h3>
              </div>
              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  isCorrect
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm text-slate-700">
              <div className="rounded-md bg-slate-50 p-3">
                <dt className="font-semibold text-slate-950">Your answer</dt>
                <dd>
                  {userAnswer
                    ? `${userAnswer}. ${question.choices[userAnswer]}`
                    : "Not answered"}
                </dd>
              </div>
              <div className="rounded-md bg-emerald-50 p-3">
                <dt className="font-semibold text-slate-950">
                  Correct answer
                </dt>
                <dd>
                  {question.correctAnswer}.{" "}
                  {question.choices[question.correctAnswer]}
                </dd>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <dt className="font-semibold text-slate-950">
                  English explanation
                </dt>
                <dd className="mt-1 leading-6">
                  {question.englishExplanation}
                </dd>
              </div>
              <div className="rounded-md border border-slate-200 p-3">
                <dt className="font-semibold text-slate-950">
                  Nepali explanation
                </dt>
                <dd className="mt-1 leading-6">
                  {question.nepaliExplanation ||
                    "Nepali explanation coming soon."}
                </dd>
              </div>
            </dl>
          </article>
        );
      })}
    </section>
  );
}

function getSectionScores(answers: Record<string, ChoiceKey>) {
  return dailyQuestions.reduce(
    (scores, question) => {
      scores[question.section].total += 1;
      if (answers[question.id] === question.correctAnswer) {
        scores[question.section].correct += 1;
      }
      return scores;
    },
    {
      vocabulary: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      workplace: { correct: 0, total: 0 },
      mixed: { correct: 0, total: 0 },
    } satisfies Record<
      DailyQuestion["section"],
      { correct: number; total: number }
    >,
  );
}

function getWeakSection(
  sectionScores: Record<
    DailyQuestion["section"],
    { correct: number; total: number }
  >,
) {
  return Object.entries(sectionScores)
    .filter(([, score]) => score.total > 0)
    .sort(([, a], [, b]) => {
      const aRate = a.correct / a.total;
      const bRate = b.correct / b.total;
      return aRate - bRate;
    })[0]?.[0] as DailyQuestion["section"] | undefined;
}
