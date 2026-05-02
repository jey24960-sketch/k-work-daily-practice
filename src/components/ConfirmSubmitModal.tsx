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
          Are you sure you want to submit?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You have {unansweredCount} unanswered{" "}
          {unansweredCount === 1 ? "question" : "questions"}.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
