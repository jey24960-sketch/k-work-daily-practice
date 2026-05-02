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
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <h1 className="text-4xl font-bold text-slate-950">
          {score} / {total}
        </h1>
        <p className="pb-1 text-lg font-semibold text-slate-600">{percent}%</p>
      </div>
      <p className="mt-4 inline-flex rounded-md bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white">
        {getLevel(score)}
      </p>
    </section>
  );
}
