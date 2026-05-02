"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { USER_INFO_KEY, type TargetIndustry, type TestUser } from "@/lib/exam";

const industries: TargetIndustry[] = ["Manufacturing", "Agriculture", "Other"];

export default function TestIntroPage() {
  const router = useRouter();
  const [form, setForm] = useState<TestUser>({
    name: "",
    contact: "",
    industry: "Manufacturing",
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(USER_INFO_KEY);
    if (stored) {
      queueMicrotask(() => setForm(JSON.parse(stored) as TestUser));
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(form));
    router.push("/exam");
  }

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          EPS Practice Nepal
        </p>
        <h1 className="mt-3 text-3xl font-bold">Free Level Test 01</h1>

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

        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold">Before you start</h2>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Your name"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-700">
              Phone or email
            </span>
            <input
              value={form.contact}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  contact: event.target.value,
                }))
              }
              required
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Phone number or email"
            />
          </label>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-slate-700">
              Target industry
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {industries.map((industry) => (
                <label
                  key={industry}
                  className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-3 text-sm font-semibold transition ${
                    form.industry === industry
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="industry"
                    value={industry}
                    checked={form.industry === industry}
                    onChange={() =>
                      setForm((current) => ({ ...current, industry }))
                    }
                    className="sr-only"
                  />
                  {industry}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-slate-950 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Start Test
          </button>
        </form>
      </div>
    </main>
  );
}
