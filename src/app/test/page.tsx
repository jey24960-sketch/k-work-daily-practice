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
  RESULT_KEY,
  TEST_ATTEMPT_ID_KEY,
  TEST_ATTEMPT_PENDING_ID_KEY,
  USER_INFO_KEY,
  readClientUtmParams,
  trackExamEvent,
} from "@/lib/exam";

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
    void trackExamEvent("test_started", { setId: "levelTestSetA" });
    router.push("/exam");
  }

  return (
    <main className="min-h-dvh bg-[#f4f6fb] px-4 py-5 text-slate-950">
      <div className="mx-auto max-w-[430px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <Image
              src={BRAND_ICON_PATH}
              alt="K-Work Daily Practice icon"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {BRAND_NAME} free level test
              </p>
              <p className="text-xs font-medium text-slate-500">
                {BRAND_COMPANION}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1e5fdc]" />
          EPS-TOPIK Level Test
        </p>
        <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight">
          Start your free EPS-TOPIK level test
        </h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#1e5fdc]">
          लगइन बिना तुरुन्त नतिजा
        </p>
        <p className="mt-3 text-base leading-7 text-slate-600">
          No login or contact information is needed before the test.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            "20 questions",
            "About 20 minutes",
            "Instant result",
            "No login required",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm font-semibold text-slate-700">{item}</p>
            </div>
          ))}
        </div>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
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
                className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e5fdc] text-xs font-bold text-white">
                  OK
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Sections</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["Vocabulary", "Grammar", "Reading", "Workplace Korean"].map(
              (section) => (
                <span
                  key={section}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {section}
                </span>
              ),
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            शब्दावली, व्याकरण, पढाइ, र कार्यस्थल कोरियन अभ्यास।
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Ready to begin?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Answer what you know. You can submit anytime and review your
            answers after the result.
          </p>
          <button
            type="button"
            onClick={handleStartTest}
            className="mt-6 min-h-14 w-full rounded-2xl bg-[#1e5fdc] px-5 py-4 text-base font-semibold text-white shadow-[0_10px_22px_rgba(30,95,220,0.18)] transition hover:bg-[#174db8] focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
          >
            Start Free Level Test
          </button>
          <p className="mt-3 text-center text-xs font-medium text-slate-500">
            नि:शुल्क अभ्यास. नतिजा तुरुन्त देखिन्छ।
          </p>
        </section>

        <footer className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3">
          <p className="text-xs leading-5 text-slate-500">{DISCLAIMER}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            स्वतन्त्र अभ्यास सेवा. HRD Korea / EPS Korea सँग सम्बन्ध छैन।
          </p>
        </footer>
      </div>
    </main>
  );
}
