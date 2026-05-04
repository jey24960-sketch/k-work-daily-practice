"use client";

type ConfirmSubmitModalProps = {
  unansweredCount: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmSubmitModal({
  unansweredCount,
  onCancel,
  onConfirm,
}: ConfirmSubmitModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-title"
        className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
      >
        <h2 id="submit-title" className="text-lg font-semibold text-slate-950">
          Submit your test?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You have {unansweredCount} unanswered{" "}
          {unansweredCount === 1 ? "question" : "questions"}. Your result will
          show immediately, and you can review every answer.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Keep working
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Submit test
          </button>
        </div>
      </div>
    </div>
  );
}
