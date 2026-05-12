"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnswerReview } from "@/components/AnswerReview";
import { ResultSummary } from "@/components/ResultSummary";
import { SectionBreakdown } from "@/components/SectionBreakdown";
import { BRAND_ICON_PATH, DISCLAIMER } from "@/lib/brand";
import {
  EXAM_ANSWERS_KEY,
  EXAM_STARTED_AT_KEY,
  RESULT_KEY,
  TEST_ATTEMPT_ID_KEY,
  TEST_ATTEMPT_PENDING_ID_KEY,
  TEST_STARTED_TRACKED_KEY,
  USER_INFO_KEY,
  getSectionScores,
  getScoreTier,
  getWeakAreaFeedback,
  getWeakestSections,
  readClientUtmParams,
  sectionLabels,
  trackExamEvent,
  type OptInLead,
  type StoredResult,
} from "@/lib/exam";
import { getLevelTestSet } from "@/lib/questionBank";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  normalizeUtmParams,
  saveOptInLead,
  saveShareEvent,
  saveTestAttempt,
  type SaveShareEventPayload,
} from "@/lib/supabaseEvents";
import { createClientUuid } from "@/lib/clientUuid";
import type { PracticeQuestion } from "@/types/questions";

const industries: OptInLead["industry"][] = [
  "Manufacturing",
  "Agriculture/Livestock",
  "Construction",
  "Service",
  "Fishery",
  "Other",
];

const resultPageCopy = {
  noResultCta: "Start Free Level Test",
  actionsTitle: "Recommended next actions",
  actionsHelper: "Review answers, retake the set, or share from the main share area.",
  reviewAnswersCta: "Review My Answers",
  retakeCta: "Retake Level Test",
  shareScoreCta: "Share My Score",
  optInJumpCta: "Get more free EPS practice sets",
  shareTitle: "Share the free level test",
  shareHelper:
    "Share a safe practice-test score message. This is only a practice result.",
  shareOpened: "Share sheet opened.",
  copySuccess: "Score copied. You can paste it into WhatsApp or Messenger.",
  copyUnavailable: "Copy is not available. Use the WhatsApp share button below.",
  copyFailed: "Copy failed. Use the WhatsApp share button below.",
  shareCancelled: "Share cancelled.",
  whatsappCta: "Share on WhatsApp",
  optInTitle: "Get more free EPS practice sets",
  optInDescription:
    "Leave your contact only if you want updates about new free practice sets from K-Work Daily Practice.",
  optInPrivacy: "We will not share your contact.",
  optInButton: "Notify me about free practice sets",
  optInConsent:
    "By submitting, you agree to be contacted about free EPS practice sets from K-Work Daily Practice.",
  optInMissingContact: "Please enter an email, phone, or WhatsApp contact.",
  optInSaving: "Saving your request...",
  optInFailure:
    "We could not save your request right now. Your test result and review are still available.",
  optInSuccess:
    "Thank you. We will contact you only about K-Work Daily Practice updates.",
  optInUnavailable:
    "Optional updates are unavailable in this environment. Your result and answer review are still available.",
} as const;

const WEAK_SECTION_RATE = 0.7;
const SET_ID = "levelTestSetA";

export default function ResultPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [questionLoadError, setQuestionLoadError] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingResult, setIsLoadingResult] = useState(true);
  const [result, setResult] = useState<StoredResult | null>(null);
  const [testAttemptId, setTestAttemptId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [shareBaseUrl, setShareBaseUrl] = useState("");
  const [optInStatus, setOptInStatus] = useState("");
  const attemptInsertStartedRef = useRef(false);
  const resultViewedTrackedRef = useRef(false);
  const [optIn, setOptIn] = useState<OptInLead>({
    name: "",
    contact: "",
    industry: "",
  });
  const isOptInAvailable = isSupabaseConfigured();

  useEffect(() => {
    let isCurrent = true;

    getLevelTestSet("levelTestSetA")
      .then((loadedQuestions) => {
        if (!isCurrent) return;
        setQuestions(loadedQuestions);
        setQuestionLoadError(
          loadedQuestions.length
            ? ""
            : "We could not load the answer review questions right now.",
        );
      })
      .catch(() => {
        if (!isCurrent) return;
        setQuestionLoadError(
          "We could not load the answer review questions right now.",
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
    const storedResult = window.localStorage.getItem(RESULT_KEY);
    const storedAttemptId = window.localStorage.getItem(TEST_ATTEMPT_ID_KEY);

    queueMicrotask(() => {
      if (storedResult) {
        const parsedResult = JSON.parse(storedResult) as StoredResult;
        setResult(parsedResult);
      }
      setShareBaseUrl(window.location.origin || window.location.href);
      if (storedAttemptId) {
        setTestAttemptId(storedAttemptId);
        window.localStorage.removeItem(TEST_ATTEMPT_PENDING_ID_KEY);
      }
      setIsLoadingResult(false);
    });
  }, []);

  const sectionScores = useMemo(() => {
    if (!result || !questions.length) return null;
    return getSectionScores(questions, result.answers);
  }, [result, questions]);

  const weakSections = useMemo(() => {
    if (!sectionScores) return [];
    return getWeakestSections(sectionScores, 2);
  }, [sectionScores]);

  useEffect(() => {
    if (!result || !sectionScores || weakSections.length === 0) return;
    if (attemptInsertStartedRef.current) return;

    const storedAttemptId = window.localStorage.getItem(TEST_ATTEMPT_ID_KEY);
    if (storedAttemptId) {
      queueMicrotask(() => setTestAttemptId(storedAttemptId));
      window.localStorage.removeItem(TEST_ATTEMPT_PENDING_ID_KEY);
      attemptInsertStartedRef.current = true;
      return;
    }

    const attemptId = getStableAttemptId(result);
    attemptInsertStartedRef.current = true;
    saveTestAttempt({
      id: attemptId,
      total_score: result.score,
      total_questions: result.total,
      vocabulary_score: sectionScores.vocabulary.correct,
      grammar_score: sectionScores.grammar.correct,
      reading_score: sectionScores.reading.correct,
      workplace_score: sectionScores.workplace.correct,
      weakest_sections: weakSections.map(({ section }) => sectionLabels[section]),
      target_industry: null,
      user_agent: navigator.userAgent || null,
      referrer: document.referrer || null,
      ...normalizeUtmParams(readClientUtmParams()),
    }).then((insertedId) => {
      if (!insertedId) return;
      window.localStorage.setItem(TEST_ATTEMPT_ID_KEY, insertedId);
      window.localStorage.removeItem(TEST_ATTEMPT_PENDING_ID_KEY);
      setTestAttemptId(insertedId);
    });
  }, [result, sectionScores, weakSections]);

  useEffect(() => {
    if (!result || !sectionScores || weakSections.length === 0) return;
    if (resultViewedTrackedRef.current) return;

    resultViewedTrackedRef.current = true;
    void trackExamEvent("result_viewed", {
      attemptId: result.attemptId ?? testAttemptId,
      setId: SET_ID,
      totalQuestions: result.total,
      totalScore: result.score,
      weakestSections: weakSections.map(({ section }) => sectionLabels[section]),
    });
  }, [result, sectionScores, testAttemptId, weakSections]);

  function handleRetake() {
    readClientUtmParams();
    void trackExamEvent("retake_clicked", {
      attemptId: testAttemptId ?? result?.attemptId ?? null,
      previousScore: result?.score ?? null,
      setId: SET_ID,
    });
    window.localStorage.removeItem(RESULT_KEY);
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
    window.localStorage.removeItem(EXAM_STARTED_AT_KEY);
    window.localStorage.removeItem(USER_INFO_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_ID_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_PENDING_ID_KEY);
    window.localStorage.removeItem(TEST_STARTED_TRACKED_KEY);
    window.localStorage.setItem(EXAM_STARTED_AT_KEY, Date.now().toString());
    window.localStorage.setItem(TEST_STARTED_TRACKED_KEY, "true");
    void trackExamEvent("test_started", {
      retake: true,
      setId: SET_ID,
    });
    router.push("/exam");
  }

  async function handleShare() {
    if (!result) return;

    const siteUrl = getShareUrl(
      shareBaseUrl || window.location.origin || window.location.href,
      "native",
    );
    const shareText = getShareText(result.score, siteUrl);
    const shareData = {
      title: "K-Work Daily Practice Free EPS-TOPIK Level Test",
      text: shareText,
      url: siteUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        void trackShareClick("web_share", "native");
        setShareStatus(resultPageCopy.shareOpened);
        return;
      }

      if (navigator.clipboard) {
        const copyUrl = getShareUrl(
          shareBaseUrl || window.location.origin || window.location.href,
          "copy",
        );
        await navigator.clipboard.writeText(getShareText(result.score, copyUrl));
        void trackShareClick("copy_link", "copy");
        setShareStatus(resultPageCopy.copySuccess);
        return;
      }

      setShareStatus(resultPageCopy.copyUnavailable);
    } catch (error) {
      if (isShareCancelError(error)) {
        setShareStatus(resultPageCopy.shareCancelled);
        return;
      }

      setShareStatus(resultPageCopy.copyFailed);
    }
  }

  function handleOptInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contact = optIn.contact.trim();

    if (!contact) {
      setOptInStatus(resultPageCopy.optInMissingContact);
      return;
    }

    const contactType = getContactType(contact);
    setOptInStatus(resultPageCopy.optInSaving);
    void trackExamEvent("opt_in_submitted", {
      attemptId: testAttemptId ?? result?.attemptId ?? null,
      contactType,
      setId: SET_ID,
      targetIndustry: optIn.industry || null,
      totalScore: result?.score ?? null,
    });
    saveOptInLead({
      name: optIn.name.trim() || null,
      contact,
      contact_type: contactType,
      target_industry: optIn.industry || null,
      total_score: result?.score ?? null,
      consent: true,
      source: "result_page_opt_in",
      ...normalizeUtmParams(readClientUtmParams()),
    }).then((saved) => {
      if (!saved) {
        setOptInStatus(resultPageCopy.optInFailure);
        return;
      }

      setOptInStatus(resultPageCopy.optInSuccess);
    });
  }

  async function trackShareClick(
    channel: SaveShareEventPayload["channel"],
    utmMedium: "whatsapp" | "native" | "copy",
  ) {
    const score = result?.score ?? null;
    void trackExamEvent("share_clicked", {
      attemptId:
        testAttemptId ??
        result?.attemptId ??
        window.localStorage.getItem(TEST_ATTEMPT_PENDING_ID_KEY),
      channel,
      score,
      scoreTier: score === null ? null : getScoreTier(score),
      setId: SET_ID,
      totalScore: result?.score ?? null,
    });
    await saveShareEvent({
      attempt_id:
        testAttemptId ??
        result?.attemptId ??
        window.localStorage.getItem(TEST_ATTEMPT_PENDING_ID_KEY),
      total_score: result?.score ?? null,
      channel,
      ...normalizeUtmParams({
        ...readClientUtmParams(),
        utm_source: "share",
        utm_medium: utmMedium,
        utm_campaign: "first_100_test",
      }),
    });
  }

  if (isLoadingResult || (isLoadingQuestions && result)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fb] px-4 text-slate-950">
        <section className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Loading result</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Preparing your score and answer review...
          </p>
        </section>
      </main>
    );
  }

  if (questionLoadError && result) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fb] px-4 text-slate-950">
        <section className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Review unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {questionLoadError}
          </p>
          <Link
            href="/test"
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#1e5fdc] px-4 py-3 text-sm font-semibold text-white"
          >
            Retake Level Test
          </Link>
        </section>
      </main>
    );
  }

  if (!result || !sectionScores || weakSections.length === 0) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f4f6fb] px-4 text-slate-950">
        <section className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <h1 className="text-xl font-semibold">No result found</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Take the free level test to see your score and answer review.
          </p>
          <Link
            href="/test"
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#1e5fdc] px-4 py-3 text-sm font-semibold text-white"
          >
            {resultPageCopy.noResultCta}
          </Link>
        </section>
      </main>
    );
  }

  const whatsappShareUrl = getShareUrl(shareBaseUrl, "whatsapp");
  const shareText = getShareText(result.score, whatsappShareUrl);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const focusSections = weakSections.filter(
    ({ correct, total }) => total > 0 && correct / total < WEAK_SECTION_RATE,
  );
  const strongOverall = focusSections.length === 0;
  const focusSectionNames = focusSections.map(
    ({ section }) => sectionLabels[section],
  );

  return (
    <main className="min-h-dvh bg-[#f4f6fb] px-4 py-5 text-slate-950">
      <div className="mx-auto max-w-[430px]">
        <header className="mb-5">
          <div className="mb-3 flex items-center gap-3">
            <Image
              src={BRAND_ICON_PATH}
              alt="K-Work Daily Practice icon"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
            />
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1e5fdc]" />
              EPS-TOPIK Level Test
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            Your result
          </h1>
        </header>

        <div className="grid gap-4">
          <ResultSummary score={result.score} total={result.total} />
          <SectionBreakdown scores={sectionScores} />
        </div>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {strongOverall ? (
            <>
              <h2 className="text-lg font-semibold">Strong overall</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your section scores are balanced and your total score is high.
                Keep practicing regularly so this level stays steady.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Focus areas</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Start with:{" "}
                <span className="font-semibold text-slate-950">
                  {focusSectionNames.join(", ")}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {focusSectionNames.map((sectionName) => (
                  <span
                    key={sectionName}
                    className="rounded-full border border-[#1e5fdc]/20 bg-[#1e5fdc]/10 px-3 py-1.5 text-xs font-semibold text-[#1e5fdc]"
                  >
                    {sectionName}
                  </span>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {focusSections.map(({ section, correct, total }) => (
                  <p key={section} className="text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">
                      {sectionLabels[section]} ({correct}/{total}):
                    </span>{" "}
                    {getWeakAreaFeedback(section)}
                  </p>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{resultPageCopy.actionsTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {resultPageCopy.actionsHelper}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="#answer-review"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#1e5fdc] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174db8] focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
            >
              {resultPageCopy.reviewAnswersCta}
            </a>
            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
            >
              {resultPageCopy.retakeCta}
            </button>
            <a
              href="#share-result"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
            >
              {resultPageCopy.shareScoreCta}
            </a>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Same questions for now - Set B is coming soon.
            <br />
            अहिले उही प्रश्नहरू फेरि अभ्यास हुन्छन् — Set B चाँडै आउँदैछ।
          </p>
          <a
            href="#free-practice-updates"
            className="mt-3 inline-flex text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
          >
            {resultPageCopy.optInJumpCta}
          </a>
        </section>

        <div className="mt-6">
          <AnswerReview questions={questions} answers={result.answers} />
        </div>

        <section
          id="share-result"
          className="mt-6 scroll-mt-20 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold">{resultPageCopy.shareTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {resultPageCopy.shareHelper}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => void trackShareClick("whatsapp", "whatsapp")}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#1e5fdc]/20 bg-[#1e5fdc]/10 px-4 py-3 text-sm font-semibold text-[#1e5fdc] transition hover:bg-[#1e5fdc]/15 focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/30"
            >
              {resultPageCopy.whatsappCta}
            </a>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#1e5fdc] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174db8] focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
            >
              {resultPageCopy.shareScoreCta}
            </button>
          </div>
          {shareStatus ? (
            <p className="mt-3 text-sm text-slate-600">{shareStatus}</p>
          ) : null}
        </section>

        <section
          id="free-practice-updates"
          className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Optional
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            {resultPageCopy.optInTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {resultPageCopy.optInDescription}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {resultPageCopy.optInPrivacy}
          </p>
          {isOptInAvailable ? (
          <form onSubmit={handleOptInSubmit} className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Optional name
              </span>
              <input
                autoComplete="name"
                value={optIn.name}
                onChange={(event) =>
                  setOptIn((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-[#1e5fdc] focus:ring-2 focus:ring-[#1e5fdc]/15"
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Email or phone/WhatsApp contact
              </span>
              <input
                autoComplete="email"
                inputMode="text"
                value={optIn.contact}
                onChange={(event) =>
                  setOptIn((current) => ({
                    ...current,
                    contact: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-[#1e5fdc] focus:ring-2 focus:ring-[#1e5fdc]/15"
                placeholder="Email, phone, or WhatsApp"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Optional target industry
              </span>
              <select
                value={optIn.industry}
                onChange={(event) =>
                  setOptIn((current) => ({
                    ...current,
                    industry: event.target.value as OptInLead["industry"],
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-[#1e5fdc] focus:ring-2 focus:ring-[#1e5fdc]/15"
              >
                <option value="">Select industry (optional)</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="min-h-12 w-full rounded-2xl bg-[#1e5fdc] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174db8] focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40 sm:w-auto"
            >
              {resultPageCopy.optInButton}
            </button>
            <p className="text-xs leading-5 text-slate-500">
              {resultPageCopy.optInConsent}
            </p>
            {optInStatus ? (
              <p className="text-sm leading-6 text-slate-600">{optInStatus}</p>
            ) : null}
          </form>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              {resultPageCopy.optInUnavailable}
            </p>
          )}
        </section>

        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40 sm:w-auto"
          >
            Back to Home
          </Link>
        </div>

        <footer className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3">
          <p className="text-xs leading-5 text-slate-500">{DISCLAIMER}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            यो स्वतन्त्र अभ्यास सेवा हो। HRD Korea, EPS Korea, EPS Nepal वा
            कुनै सरकारी निकायसँग सम्बन्धित छैन।
          </p>
        </footer>
      </div>
    </main>
  );
}

function getContactType(contact: string) {
  if (contact.includes("@")) return "email";
  if (contact.replace(/\D/g, "").length >= 7) return "phone_or_whatsapp";
  return "other";
}

function getShareText(score: number, url: string) {
  if (score < 12) {
    return `I tried a free EPS-TOPIK level test for Nepali learners. Try it here: ${url}`;
  }

  return `I scored ${score}/20 on a free EPS-TOPIK level test for Nepali learners. Try it here: ${url}`;
}

function getShareUrl(url: string, medium: "whatsapp" | "native" | "copy") {
  const fallbackUrl = "https://k-work-daily-practice.vercel.app";

  try {
    const shareUrl = new URL(url || fallbackUrl);
    shareUrl.searchParams.set("utm_source", "share");
    shareUrl.searchParams.set("utm_medium", medium);
    shareUrl.searchParams.set("utm_campaign", "first_100_test");
    return shareUrl.toString();
  } catch {
    const separator = fallbackUrl.includes("?") ? "&" : "?";
    return `${fallbackUrl}${separator}utm_source=share&utm_medium=${medium}&utm_campaign=first_100_test`;
  }
}

function isShareCancelError(error: unknown) {
  if (!(error instanceof DOMException)) return false;
  return error.name === "AbortError" || error.name === "NotAllowedError";
}

function getStableAttemptId(result: StoredResult) {
  if (result.attemptId) return result.attemptId;

  const pendingAttemptId = window.localStorage.getItem(
    TEST_ATTEMPT_PENDING_ID_KEY,
  );
  if (pendingAttemptId) return pendingAttemptId;

  const attemptId = createClientUuid();
  window.localStorage.setItem(TEST_ATTEMPT_PENDING_ID_KEY, attemptId);
  return attemptId;
}
