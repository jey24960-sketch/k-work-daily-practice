import type { Question } from "../../data/questions";
import { sectionLabels } from "@/lib/exam";

type SectionBreakdownProps = {
  scores: Record<Question["section"], { correct: number; total: number }>;
};

export function SectionBreakdown({ scores }: SectionBreakdownProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        Section Breakdown
      </h2>
      <div className="mt-4 space-y-4">
        {Object.entries(scores).map(([section, score]) => {
          const percent =
            score.total === 0 ? 0 : Math.round((score.correct / score.total) * 100);

          return (
            <div key={section}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {sectionLabels[section as Question["section"]]}
                </span>
                <span className="font-semibold text-slate-950">
                  {score.correct}/{score.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
