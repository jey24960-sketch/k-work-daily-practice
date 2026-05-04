"use client";

import { useRouter } from "next/navigation";
import {
  EXAM_ANSWERS_KEY,
  RESULT_KEY,
  TEST_ATTEMPT_ID_KEY,
  TEST_ATTEMPT_PENDING_ID_KEY,
  USER_INFO_KEY,
  readClientUtmParams,
  trackExamEvent,
} from "@/lib/exam";

export default function TestIntroPage() {
  const router = useRouter();

  function handleStartTest() {
    readClientUtmParams();
    window.localStorage.removeItem(USER_INFO_KEY);
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
    window.localStorage.removeItem(RESULT_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_ID_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_PENDING_ID_KEY);
    trackExamEvent("test_started");
    router.push("/exam");
  }

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          K-Work Daily Practice free level test
        </p>
        <p className="mt-1 text-sm font-medium text-slate-500">
          K-Work दैनिक अभ्यास
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight">
          Start your free EPS-TOPIK level test
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          No login or contact information is needed before the test.
        </p>

        <section className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            "20 questions",
            "About 20 minutes",
            "Instant result",
            "No login required",
          ].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-semibold text-slate-700">{item}</p>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">What you will get</h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            {[
              "Score immediately after submitting",
              "Check your weak areas",
              "Answer review with explanations",
              "Retake option after the result",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-md bg-slate-50 px-3 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  OK
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Sections</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["Vocabulary", "Grammar", "Reading", "Workplace Korean"].map(
              (section) => (
                <span
                  key={section}
                  className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {section}
                </span>
              ),
            )}
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Ready to begin?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Answer what you know. You can submit anytime and review your
            answers after the result.
          </p>
          <button
            type="button"
            onClick={handleStartTest}
            className="mt-6 min-h-14 w-full rounded-md bg-slate-950 px-5 py-4 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Start Free Level Test
          </button>
        </section>

        <footer className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-sm leading-6 text-slate-500">
            K-Work Daily Practice is an independent practice service. It is not
            affiliated with HRD Korea, EPS Korea, EPS Nepal, or any government
            agency.
          </p>
        </footer>
      </div>
    </main>
  );
}
