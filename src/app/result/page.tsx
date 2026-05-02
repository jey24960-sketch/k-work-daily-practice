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
  UTM_KEY,
  USER_INFO_KEY,
  getSectionScores,
  getUtmParams,
  getWeakAreaFeedback,
  getWeakestSections,
  hasUtmParams,
  sectionLabels,
  trackExamEvent,
  type OptInLead,
  type StoredResult,
  type UtmParams,
} from "@/lib/exam";
import {
  normalizeUtmParams,
  saveOptInLead,
  saveShareEvent,
  saveTestAttempt,
  type SaveShareEventPayload,
} from "@/lib/supabaseEvents";

const industries: OptInLead["industry"][] = [
  "Manufacturing",
  "Agriculture/Livestock",
  "Construction",
  "Service",
  "Fishery",
  "Other",
];

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
      attemptInsertStartedRef.current = true;
      return;
    }

    attemptInsertStartedRef.current = true;
    saveTestAttempt({
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
      ...normalizeUtmParams(readUtmParams()),
    }).then((insertedId) => {
      if (!insertedId) return;
      window.localStorage.setItem(TEST_ATTEMPT_ID_KEY, insertedId);
      setTestAttemptId(insertedId);
    });
  }, [result, sectionScores, weakSections]);

  function handleRetake() {
    trackExamEvent("retake_clicked");
    window.localStorage.removeItem(RESULT_KEY);
    window.localStorage.removeItem(EXAM_ANSWERS_KEY);
    window.localStorage.removeItem(USER_INFO_KEY);
    window.localStorage.removeItem(TEST_ATTEMPT_ID_KEY);
  }

  async function handleShare() {
    if (!result) return;

    const siteUrl = shareBaseUrl || window.location.origin || window.location.href;
    const shareText = `I scored ${result.score}/20 on K-Work Tayari EPS-TOPIK Free Level Test. Try it here: ${siteUrl}`;
    const shareData = {
      title: "K-Work Tayari EPS-TOPIK Free Level Test",
      text: shareText,
      url: siteUrl,
    };

    try {
      if (navigator.share) {
        await trackShareClick("web_share");
        await navigator.share(shareData);
        setShareStatus("Share sheet opened.");
        return;
      }

      if (navigator.clipboard) {
        await trackShareClick("copy_link");
        await navigator.clipboard.writeText(shareText);
        setShareStatus(
          "Score copied. You can paste it into WhatsApp or Messenger.",
        );
        return;
      }

      setShareStatus("Copy is not available. Use the WhatsApp share button below.");
    } catch {
      setShareStatus("Copy failed. Use the WhatsApp share button below.");
    }
  }

  function handleOptInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contact = optIn.contact.trim();

    if (!contact) {
      setOptInStatus("Please enter an email, phone, or WhatsApp contact.");
      return;
    }

    setOptInStatus("Saving your request...");
    saveOptInLead({
      name: optIn.name.trim() || null,
      contact,
      contact_type: getContactType(contact),
      target_industry: optIn.industry || null,
      total_score: result?.score ?? null,
      consent: true,
      source: "result_page_opt_in",
      ...normalizeUtmParams(readUtmParams()),
    }).then((saved) => {
      if (!saved) {
        setOptInStatus(
          "We could not save your request right now. Your test result and review are still available.",
        );
        return;
      }

      setOptInStatus(
      "Thank you. We will contact you only about K-Work Tayari practice updates.",
      );
    });
  }

  async function trackShareClick(channel: SaveShareEventPayload["channel"]) {
    await saveShareEvent({
      attempt_id: testAttemptId,
      total_score: result?.score ?? null,
      channel,
      ...normalizeUtmParams(readUtmParams()),
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
            Start Free Test
          </Link>
        </section>
      </main>
    );
  }

  const shareText = `I scored ${result.score}/20 on K-Work Tayari EPS-TOPIK Free Level Test. Try it here:`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareBaseUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareBaseUrl)}`;

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <header className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Free Level Test 01
          </p>
          <h1 className="mt-2 text-3xl font-bold">Your Diagnostic Result</h1>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ResultSummary score={result.score} total={result.total} />
          <SectionBreakdown scores={sectionScores} />
        </div>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Weakness Analysis</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your weak areas:{" "}
            <span className="font-semibold text-slate-950">
              {weakSections
                .map(({ section }) => sectionLabels[section])
                .join(", ")}
            </span>
          </p>
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
          <h2 className="text-lg font-semibold">Share your score with friends</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Share a safe practice-test score message. This does not claim to be
            an official score.
          </p>
          <button
            type="button"
            onClick={handleShare}
            className="mt-4 w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-auto"
          >
            Share my score
          </button>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => void trackShareClick("whatsapp")}
              className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Share on WhatsApp
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => void trackShareClick("facebook")}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Share on Facebook
            </a>
          </div>
          {shareStatus ? (
            <p className="mt-3 text-sm text-slate-600">{shareStatus}</p>
          ) : null}
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/test"
            onClick={handleRetake}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Retake test
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

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            Get more free EPS practice sets
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Leave your contact only if you want updates about new free practice
            sets.
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
                required
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
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-auto"
            >
              Notify me about free practice sets
            </button>
            <p className="text-xs leading-5 text-slate-500">
              By submitting, you agree to be contacted about free EPS practice
              sets from K-Work Tayari.
            </p>
            {optInStatus ? (
              <p className="text-sm leading-6 text-slate-600">{optInStatus}</p>
            ) : null}
          </form>
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

function readUtmParams(): UtmParams {
  const currentUtm = getUtmParams(new URLSearchParams(window.location.search));
  if (hasUtmParams(currentUtm)) {
    window.localStorage.setItem(UTM_KEY, JSON.stringify(currentUtm));
    return currentUtm;
  }

  const storedUtm = window.localStorage.getItem(UTM_KEY);
  if (!storedUtm) return {};

  try {
    return JSON.parse(storedUtm) as UtmParams;
  } catch {
    return {};
  }
}

function getContactType(contact: string) {
  if (contact.includes("@")) return "email";
  if (contact.replace(/\D/g, "").length >= 7) return "phone_or_whatsapp";
  return "other";
}
