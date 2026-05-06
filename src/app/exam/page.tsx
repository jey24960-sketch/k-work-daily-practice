"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmSubmitModal } from "@/components/ConfirmSubmitModal";
import { ExamHeader } from "@/components/ExamHeader";
import { QuestionCard } from "@/components/QuestionCard";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import {
  EXAM_ANSWERS_KEY,
  RESULT_KEY,
  scoreAnswers,
  trackExamEvent,
  type ChoiceKey,
} from "@/lib/exam";
import { createClientUuid } from "@/lib/clientUuid";
import { getLevelTestSet } from "@/lib/questionBank";
import type { PracticeQuestion } from "@/types/questions";

const TEST_DURATION_SECONDS = 20 * 60;

export default function ExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [questionLoadError, setQuestionLoadError] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ChoiceKey>>({});
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION_SECONDS);
  const [showConfirm, setShowConfirm] = useState(false);
  const submittedRef = useRef(false);
  const answersLoadedRef = useRef(false);

  useEffect(() => {
    let isCurrent = true;

    getLevelTestSet("levelTestSetA")
      .then((loadedQuestions) => {
        if (!isCurrent) return;

        setQuestions(loadedQuestions);
        setQuestionLoadError(
          loadedQuestions.length
            ? ""
            : "We could not load the level test questions right now.",
        );
      })
      .catch(() => {
        if (!isCurrent) return;
        setQuestionLoadError(
          "We could not load the level test questions right now.",
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoadingQuestions(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const storedAnswers = window.localStorage.getItem(EXAM_ANSWERS_KEY);
    queueMicrotask(() => {
      if (storedAnswers) {
        setAnswers(JSON.parse(storedAnswers) as Record<string, ChoiceKey>);
      }
      answersLoadedRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!answersLoadedRef.current) return;
    window.localStorage.setItem(EXAM_ANSWERS_KEY, JSON.stringify(answers));
  }, [answers]);

  const unansweredCount = useMemo(
    () => questions.filter((question) => !answers[question.id]).length,
    [answers, questions],
  );
  const answeredCount = questions.length - unansweredCount;
  const progressPercent = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const submitExam = useCallback(() => {
    if (submittedRef.current) return;
    if (!questions.length) return;
    submittedRef.current = true;

    const score = scoreAnswers(questions, answers);
    trackExamEvent("test_submitted", {
      score,
      unanswered: questions.length - Object.keys(answers).length,
    });

    const attemptId = createClientUuid();

    window.localStorage.setItem(
      RESULT_KEY,
      JSON.stringify({
        attemptId,
        answers,
        submittedAt: new Date().toISOString(),
        score,
        total: questions.length,
      }),
    );
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
    router.push("/result");
  }, [answers, questions, router]);

  useEffect(() => {
    if (!questions.length) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          submitExam();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [questions.length, submitExam]);

  const currentQuestion = questions[currentIndex];

  if (isLoadingQuestions) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fb] px-4 text-slate-950">
        <section className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Loading level test</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Preparing your questions...
          </p>
        </section>
      </main>
    );
  }

  if (questionLoadError || !currentQuestion) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fb] px-4 text-slate-950">
        <section className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Questions unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {questionLoadError ||
              "We could not load the level test questions right now."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#1e5fdc] px-4 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f4f6fb] text-slate-950">
      <ExamHeader
        secondsLeft={secondsLeft}
        onSubmit={() => setShowConfirm(true)}
      />

      <div className="mx-auto max-w-[430px] px-4 py-5">
        <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-slate-950">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="font-medium text-slate-600">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          <div
            className="mt-3 h-2 rounded-full bg-slate-100"
            aria-label={`${progressPercent}% of the test answered`}
          >
            <div
              className="h-2 rounded-full bg-[#1e5fdc]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            The test submits automatically when the timer reaches 00:00.
          </p>
        </div>
        <QuestionNavigator
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
        />

        <div className="mt-5">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedAnswer={answers[currentQuestion.id]}
            onAnswer={(answer) => {
              trackExamEvent("question_answered", {
                questionId: currentQuestion.id,
                questionNumber: currentIndex + 1,
              });
              setAnswers((current) => ({
                ...current,
                [currentQuestion.id]: answer,
              }));
            }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            disabled={currentIndex === 0}
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((index) =>
                Math.min(questions.length - 1, index + 1),
              )
            }
            disabled={currentIndex === questions.length - 1}
            className="min-h-12 rounded-2xl bg-[#1e5fdc] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174db8] focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </div>

      {showConfirm ? (
        <ConfirmSubmitModal
          unansweredCount={unansweredCount}
          onCancel={() => setShowConfirm(false)}
          onConfirm={submitExam}
        />
      ) : null}
    </main>
  );
}
