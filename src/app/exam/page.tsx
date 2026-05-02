"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "../../../data/questions";
import { ConfirmSubmitModal } from "@/components/ConfirmSubmitModal";
import { ExamHeader } from "@/components/ExamHeader";
import { QuestionCard } from "@/components/QuestionCard";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import {
  EXAM_ANSWERS_KEY,
  RESULT_KEY,
  USER_INFO_KEY,
  scoreAnswers,
  type ChoiceKey,
  type TestUser,
} from "@/lib/exam";

const TEST_DURATION_SECONDS = 20 * 60;

export default function ExamPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, ChoiceKey>>({});
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION_SECONDS);
  const [showConfirm, setShowConfirm] = useState(false);
  const submittedRef = useRef(false);
  const answersLoadedRef = useRef(false);

  useEffect(() => {
    const storedAnswers = window.localStorage.getItem(EXAM_ANSWERS_KEY);
    queueMicrotask(() => {
      if (storedAnswers) {
        setAnswers(JSON.parse(storedAnswers) as Record<number, ChoiceKey>);
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
    [answers],
  );

  const submitExam = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const storedUser = window.localStorage.getItem(USER_INFO_KEY);
    const user = storedUser ? (JSON.parse(storedUser) as TestUser) : null;
    const score = scoreAnswers(questions, answers);

    window.localStorage.setItem(
      RESULT_KEY,
      JSON.stringify({
        user,
        answers,
        submittedAt: new Date().toISOString(),
        score,
        total: questions.length,
      }),
    );
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
    router.push("/result");
  }, [answers, router]);

  useEffect(() => {
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
  }, [submitExam]);

  const currentQuestion = questions[currentIndex];

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <ExamHeader
        secondsLeft={secondsLeft}
        onSubmit={() => setShowConfirm(true)}
      />

      <div className="mx-auto max-w-4xl px-4 py-5">
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
            onAnswer={(answer) =>
              setAnswers((current) => ({
                ...current,
                [currentQuestion.id]: answer,
              }))
            }
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            disabled={currentIndex === 0}
            className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-45"
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
            className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-45"
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
