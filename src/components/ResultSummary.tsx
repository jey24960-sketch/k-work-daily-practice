import { getLevel } from "@/lib/exam";

type ResultSummaryProps = {
  score: number;
  total: number;
};

export function ResultSummary({ score, total }: ResultSummaryProps) {
  const percent = Math.round((score / total) * 100);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Total Score
      </p>
      <div className="mt-2 flex items-end gap-3">
        <h1 className="text-5xl font-bold leading-none text-slate-950">
          {score}
        </h1>
        <div className="pb-1">
          <p className="text-lg font-bold text-slate-950">/ {total}</p>
          <p className="text-sm font-semibold text-slate-600">{percent}%</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-[#1e5fdc] px-3 py-2 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          Level judgment
        </p>
        <p className="text-base font-semibold">{getLevel(score)}</p>
      </div>
    </section>
  );
}
