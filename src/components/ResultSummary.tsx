import { getLevel } from "@/lib/exam";

type ResultSummaryProps = {
  score: number;
  total: number;
};

export function ResultSummary({ score, total }: ResultSummaryProps) {
  const percent = Math.round((score / total) * 100);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
      <div className="mt-4 rounded-md bg-slate-950 px-3 py-2 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          Level judgment
        </p>
        <p className="text-base font-semibold">{getLevel(score)}</p>
      </div>
    </section>
  );
}
