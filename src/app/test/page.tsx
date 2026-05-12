"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  BRAND_COMPANION,
  BRAND_ICON_PATH,
  BRAND_NAME,
  DISCLAIMER,
} from "@/lib/brand";
import {
  EXAM_ANSWERS_KEY,
  EXAM_STARTED_AT_KEY,
  RESULT_KEY,
  TEST_ATTEMPT_ID_KEY,
  TEST_ATTEMPT_PENDING_ID_KEY,
  TEST_STARTED_TRACKED_KEY,
  USER_INFO_KEY,
  readClientUtmParams,
  trackExamEvent,
} from "@/lib/exam";

const sections = ["Vocabulary", "Grammar", "Reading", "Workplace Korean"];
const essentials = [
  "20 questions",
  "About 20 minutes",
  "Instant result",
  "No login or contact before test",
];

export default function TestIntroPage() {
  const router = useRouter();

  useEffect(() => {
    void trackExamEvent("test_intro_viewed", { setId: "levelTestSetA" });
  }, []);

  function handleStartTest() {
    readClientUtmParams();
    window.localStorage.removeItem(USER_INFO_KEY);
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
    window.localStorage.removeItem(RESULT_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_ID_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_PENDING_ID_KEY);
    window.localStorage.removeItem(EXAM_STARTED_AT_KEY);
    window.localStorage.removeItem(TEST_STARTED_TRACKED_KEY);
    window.localStorage.setItem(EXAM_STARTED_AT_KEY, Date.now().toString());
    window.localStorage.setItem(TEST_STARTED_TRACKED_KEY, "true");
    void trackExamEvent("test_started", { setId: "levelTestSetA" });
    router.push("/exam");
  }

  return (
    <main className="min-h-dvh bg-[#f4f6fb] px-4 py-5 text-slate-950">
      <div className="mx-auto max-w-[430px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <Image
              src={BRAND_ICON_PATH}
              alt="K-Work Daily Practice icon"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {BRAND_NAME}
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                {BRAND_COMPANION}
              </p>
            </div>
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1e5fdc]" />
            Free level test
          </p>
          <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight">
            Start your free EPS-TOPIK level test
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Check your current practice level before choosing what to study
            next. No personal details are collected before the test.
          </p>

          <button
            type="button"
            onClick={handleStartTest}
            className="mt-5 min-h-14 w-full rounded-2xl bg-[#1e5fdc] px-5 py-4 text-base font-semibold text-white shadow-[0_10px_22px_rgba(30,95,220,0.18)] transition hover:bg-[#174db8] focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
          >
            Start Free Level Test
          </button>

          <div className="mt-5 grid gap-2">
            {essentials.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e5fdc] text-xs font-bold text-white"
                >
                  Yes
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">4 sections</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {sections.map((section) => (
              <span
                key={section}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
              >
                {section}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Submit anytime. Your score, section breakdown, weak areas, and
            answer review appear after the test.
          </p>
        </section>

        <footer className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3">
          <p className="text-xs leading-5 text-slate-500">{DISCLAIMER}</p>
        </footer>
      </div>
    </main>
  );
}
