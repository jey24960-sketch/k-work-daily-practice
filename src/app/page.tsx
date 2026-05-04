import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-4xl flex-col justify-between">
        <header className="py-2">
          <p className="text-lg font-bold">K-Work Daily Practice</p>
          <p className="text-sm font-medium text-slate-500">
            K-Work दैनिक अभ्यास
          </p>
        </header>

        <section className="py-8 sm:py-16">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Free EPS-TOPIK Level Test
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Free EPS-TOPIK practice for Nepali learners
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Start with a 20-question level test. Then practice a little every
              day with K-Work Daily Practice.
            </p>
            <p className="mt-4 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              No login. No payment. Instant result.
            </p>
            <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white px-2 py-4 text-center">
              {[
                ["20", "questions"],
                ["20", "minutes"],
                ["4", "sections"],
              ].map(([value, label]) => (
                <div key={label} className="px-2">
                  <p className="text-2xl font-bold leading-none text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-2 text-sm font-medium text-slate-700 sm:grid-cols-3">
              {[
                "English/Nepali explanations",
                "Section weakness analysis",
                "Mobile-friendly test",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-slate-200 bg-white px-3 py-3"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/test"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-auto"
              >
                Start Free Level Test
              </Link>
              <span
                aria-disabled="true"
                className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-500 sm:w-auto"
              >
                Try Today&rsquo;s Daily Practice
              </span>
            </div>
          </div>
          <section className="mt-8 max-w-2xl">
            <h2 className="text-base font-semibold text-slate-950">
              Why learners use it
            </h2>
            <div className="mt-3 grid gap-3">
              {[
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
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <h3 className="text-sm font-semibold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <footer className="border-t border-slate-200 py-5">
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            K-Work Daily Practice is an independent practice service. It is not
            affiliated with HRD Korea, EPS Korea, EPS Nepal, or any government
            agency.
          </p>
        </footer>
      </div>
    </main>
  );
}
