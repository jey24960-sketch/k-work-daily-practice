"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { questions } from "../../../data/questions";
import { AnswerReview } from "@/components/AnswerReview";
import { ResultSummary } from "@/components/ResultSummary";
import { SectionBreakdown } from "@/components/SectionBreakdown";
import {
  EXAM_ANSWERS_KEY,
  RESULT_KEY,
  TEST_ATTEMPT_ID_KEY,
  TEST_ATTEMPT_PENDING_ID_KEY,
  USER_INFO_KEY,
  getSectionScores,
  getWeakAreaFeedback,
  getWeakestSections,
  readClientUtmParams,
  sectionLabels,
  trackExamEvent,
  type OptInLead,
  type StoredResult,
} from "@/lib/exam";
import {
  normalizeUtmParams,
  saveOptInLead,
  saveShareEvent,
  saveTestAttempt,
  type SaveShareEventPayload,
} from "@/lib/supabaseEvents";
import { createClientUuid } from "@/lib/clientUuid";

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
  actionsHelper: "Review your answers first, then retake or share your score.",
  reviewAnswersCta: "Review My Answers",
  retakeCta: "Retake Level Test",
  shareScoreCta: "Share My Score",
  optInJumpCta: "Get more free EPS practice sets",
  shareTitle: "Share your score",
  shareHelper:
    "Share a safe practice-test score message. This is only a practice result.",
  shareOpened: "Share sheet opened.",
  copySuccess: "Score copied. You can paste it into WhatsApp or Messenger.",
  copyUnavailable: "Copy is not available. Use the WhatsApp share button below.",
  copyFailed: "Copy failed. Use the WhatsApp share button below.",
  whatsappCta: "Share on WhatsApp",
  facebookCta: "Facebook",
  optInTitle: "Get more free EPS practice sets",
  optInDescription:
    "Leave your contact only if you want updates about new free practice sets from K-Work Daily Practice.",
  optInButton: "Notify me about free practice sets",
  optInConsent:
    "By submitting, you agree to be contacted about free EPS practice sets from K-Work Daily Practice.",
  optInMissingContact: "Please enter an email, phone, or WhatsApp contact.",
  optInSaving: "Saving your request...",
  optInFailure:
    "We could not save your request right now. Your test result and review are still available.",
  optInSuccess:
    "Thank you. We will contact you only about K-Work Daily Practice practice updates.",
} as const;

export default function ResultPage() {
  const [result, setResult] = useState<StoredResult | null>(null);
  const [testAttemptId, setTestAttemptId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [shareBaseUrl, setShareBaseUrl] = useState("");
  const [optInStatus, setOptInStatus] = useState("");
  const attemptInsertStartedRef = useRef(false);
  const [optIn, setOptIn] = useState<OptInLead>({
    name: "",
    contact: "",
    industry: "Manufacturing",
  });

  useEffect(() => {
    const storedResult = window.localStorage.getItem(RESULT_KEY);
    if (storedResult) {
      queueMicrotask(() =>
        setResult(JSON.parse(storedResult) as StoredResult),
      );
      trackExamEvent("result_viewed");
    }
    queueMicrotask(() =>
      setShareBaseUrl(window.location.origin || window.location.href),
    );
    const storedAttemptId = window.localStorage.getItem(TEST_ATTEMPT_ID_KEY);
    if (storedAttemptId) {
      queueMicrotask(() => setTestAttemptId(storedAttemptId));
      window.localStorage.removeItem(TEST_ATTEMPT_PENDING_ID_KEY);
    }
  }, []);

  const sectionScores = useMemo(() => {
    if (!result) return null;
    return getSectionScores(questions, result.answers);
  }, [result]);

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

  function handleRetake() {
    trackExamEvent("retake_clicked");
    window.localStorage.removeItem(RESULT_KEY);
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
    window.localStorage.removeItem(USER_INFO_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_ID_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_PENDING_ID_KEY);
  }

  async function handleShare() {
    if (!result) return;

    const siteUrl = shareBaseUrl || window.location.origin || window.location.href;
    const shareText = getShareText(result.score, siteUrl);
    const shareData = {
      title: "K-Work Daily Practice Free EPS-TOPIK Level Test",
      text: shareText,
      url: siteUrl,
    };

    try {
      if (navigator.share) {
        void trackShareClick("web_share");
        await navigator.share(shareData);
        setShareStatus(resultPageCopy.shareOpened);
        return;
      }

      if (navigator.clipboard) {
        void trackShareClick("copy_link");
        await navigator.clipboard.writeText(shareText);
        setShareStatus(resultPageCopy.copySuccess);
        return;
      }

      setShareStatus(resultPageCopy.copyUnavailable);
    } catch {
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

    setOptInStatus(resultPageCopy.optInSaving);
    saveOptInLead({
      name: optIn.name.trim() || null,
      contact,
      contact_type: getContactType(contact),
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

  async function trackShareClick(channel: SaveShareEventPayload["channel"]) {
    await saveShareEvent({
      attempt_id:
        testAttemptId ??
        result?.attemptId ??
        window.localStorage.getItem(TEST_ATTEMPT_PENDING_ID_KEY),
      total_score: result?.score ?? null,
      channel,
      ...normalizeUtmParams(readClientUtmParams()),
    });
  }

  if (!result || !sectionScores || weakSections.length === 0) {
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
            {resultPageCopy.noResultCta}
          </Link>
        </section>
      </main>
    );
  }

  const shareText = getShareText(result.score, shareBaseUrl);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareBaseUrl)}`;
  const weakSectionNames = weakSections.map(
    ({ section }) => sectionLabels[section],
  );

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Free Level Test 01
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            Your Diagnostic Result
          </h1>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ResultSummary score={result.score} total={result.total} />
          <SectionBreakdown scores={sectionScores} />
        </div>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Weak Area Review</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your weak areas:{" "}
            <span className="font-semibold text-slate-950">
              {weakSectionNames.join(", ")}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakSectionNames.map((sectionName) => (
              <span
                key={sectionName}
                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
              >
                {sectionName}
              </span>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {weakSections.map(({ section, correct, total }) => (
              <p key={section} className="text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-950">
                  {sectionLabels[section]} ({correct}/{total}):
                </span>{" "}
                {getWeakAreaFeedback(section)}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{resultPageCopy.actionsTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {resultPageCopy.actionsHelper}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="#answer-review"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {resultPageCopy.reviewAnswersCta}
            </a>
            <Link
              href="/test"
              onClick={handleRetake}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {resultPageCopy.retakeCta}
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {resultPageCopy.shareScoreCta}
            </button>
          </div>
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

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{resultPageCopy.shareTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {resultPageCopy.shareHelper}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => void trackShareClick("whatsapp")}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {resultPageCopy.whatsappCta}
            </a>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {resultPageCopy.shareScoreCta}
            </button>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => void trackShareClick("facebook")}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {resultPageCopy.facebookCta}
            </a>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Share text: {shareText}
          </p>
          {shareStatus ? (
            <p className="mt-3 text-sm text-slate-600">{shareStatus}</p>
          ) : null}
        </section>

        <section
          id="free-practice-updates"
          className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-5"
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
          <form onSubmit={handleOptInSubmit} className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Optional name
              </span>
              <input
                value={optIn.name}
                onChange={(event) =>
                  setOptIn((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Email or phone/WhatsApp contact
              </span>
              <input
                value={optIn.contact}
                onChange={(event) =>
                  setOptIn((current) => ({
                    ...current,
                    contact: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="min-h-12 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-auto"
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
        </section>

        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-auto"
          >
            Back to Home
          </Link>
        </div>

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

function getContactType(contact: string) {
  if (contact.includes("@")) return "email";
  if (contact.replace(/\D/g, "").length >= 7) return "phone_or_whatsapp";
  return "other";
}

function getShareText(score: number, url: string) {
  return `I scored ${score}/20 on K-Work Daily Practice Free EPS-TOPIK Level Test. Try it here: ${url}`;
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
