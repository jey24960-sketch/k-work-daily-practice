"use client";

import { useRouter } from "next/navigation";
import {
  EXAM_ANSWERS_KEY,
  RESULT_KEY,
  TEST_ATTEMPT_ID_KEY,
  UTM_KEY,
  USER_INFO_KEY,
  getUtmParams,
  hasUtmParams,
  trackExamEvent,
} from "@/lib/exam";

export default function TestIntroPage() {
  const router = useRouter();

  function handleStartTest() {
    const utm = getUtmParams(new URLSearchParams(window.location.search));
    if (hasUtmParams(utm)) {
      window.localStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
    window.localStorage.removeItem(USER_INFO_KEY);
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
    window.localStorage.removeItem(RESULT_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_ID_KEY);
    trackExamEvent("test_started");
    router.push("/exam");
  }

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          K-Work Tayari
        </p>
        <h1 className="mt-3 text-3xl font-bold">Free Level Test 01</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          EPS-TOPIK Free Level Test for Nepali learners preparing to work in
          Korea.
        </p>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {["20 questions", "20 minutes", "Multiple choice"].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-700">{item}</p>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Sections</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
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

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Ready to begin?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            No signup or personal information is required. Start the test and
            get your score immediately after submitting.
          </p>
          <button
            type="button"
            onClick={handleStartTest}
            className="mt-6 w-full rounded-md bg-slate-950 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Start Free Test
          </button>
        </section>

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
