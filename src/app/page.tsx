import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-4xl flex-col justify-between">
        <header className="py-2">
          <p className="text-lg font-bold">EPS Practice Nepal</p>
        </header>

        <section className="py-12 sm:py-20">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Free mock test
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Free EPS-TOPIK Level Test
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Practice Korean questions and check your current level before the
              real exam.
            </p>
            <Link
              href="/test"
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-auto"
            >
              Start Free Test
            </Link>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-5">
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            This is an independent practice service and is not affiliated with
            HRD Korea, EPS Korea, or any government agency.
          </p>
        </footer>
      </div>
    </main>
  );
}
