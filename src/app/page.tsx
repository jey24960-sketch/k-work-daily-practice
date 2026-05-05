import Link from "next/link";
import Image from "next/image";
import {
  BRAND_COMPANION,
  BRAND_ICON_PATH,
  BRAND_LOGO_PATH,
  BRAND_NAME,
  DISCLAIMER,
} from "@/lib/brand";

const benefits = [
  "English/Nepali explanations",
  "Section weakness analysis",
  "Mobile-friendly test",
];

const whyUseIt = [
  [
    "Built for Nepali EPS candidates",
    "Practice Korean questions with English and Nepali explanation support.",
  ],
  [
    "Find weak areas fast",
    "See Vocabulary, Grammar, Reading, and Workplace Korean scores.",
  ],
  [
    "Independent and free",
    "Not a government site. No fees and no login wall.",
  ],
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#f4f6fb] px-4 py-5 text-slate-950">
      <div className="mx-auto max-w-[430px]">
        <header className="sticky top-0 z-10 -mx-4 mb-5 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-[430px] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={BRAND_ICON_PATH}
                alt="K-Work Daily Practice icon"
                width={36}
                height={36}
                priority
                className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-sm"
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
            <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1e5fdc]">
              Free
            </span>
          </div>
        </header>

        <section>
          <div className="mb-4 flex justify-center">
            <div className="relative h-24 w-full max-w-[260px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <Image
                src={BRAND_LOGO_PATH}
                alt="K-Work Daily Practice logo"
                fill
                priority
                sizes="260px"
                className="object-cover"
              />
            </div>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1e5fdc]" />
            Independent EPS-TOPIK practice
          </p>
          <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-slate-950">
            Free EPS-TOPIK practice for Nepali learners
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            Start with a 20-question level test. Then practice a little every
            day with {BRAND_NAME}.
          </p>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#1e5fdc]/10 px-2.5 py-1 text-xs font-semibold text-[#1e5fdc]">
                Sample preview
              </span>
              <span className="text-xs font-medium text-slate-400">~10s</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {"\uACF5\uC7A5"} means...
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["hospital", "factory", "school", "market"].map((choice) => (
                <span
                  key={choice}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                    choice === "factory"
                      ? "border-[#1e5fdc]/30 bg-[#1e5fdc]/10 text-[#1e5fdc]"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {choice}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              After the test, you get score, weak areas, and answer review.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center">
            {[
              ["20", "questions"],
              ["20", "minutes"],
              ["4", "sections"],
            ].map(([value, label], index) => (
              <div key={label} className="contents">
                {index > 0 ? <span className="h-7 w-px bg-slate-200" /> : null}
                <div>
                  <p className="text-xl font-bold leading-none text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            {benefits.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/test"
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1e5fdc] px-5 py-3.5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(30,95,220,0.18)] transition hover:bg-[#174db8] focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
            >
              Start Free Level Test
              <span aria-hidden="true">{"\u2192"}</span>
            </Link>
            <span
              aria-disabled="true"
              className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500"
            >
              Try Today&apos;s Daily Practice
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                coming soon
              </span>
            </span>
            <p className="text-center text-xs font-medium text-slate-400">
              No login. No payment. Instant result.
            </p>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-base font-semibold text-slate-950">
            Why learners use it
          </h2>
          <div className="mt-3 grid gap-3">
            {whyUseIt.map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <h3 className="text-sm font-semibold text-slate-950">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3">
          <p className="text-xs leading-5 text-slate-500">{DISCLAIMER}</p>
        </footer>
      </div>
    </main>
  );
}
