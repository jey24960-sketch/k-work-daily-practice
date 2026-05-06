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
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl"
      >
        <h2 id="submit-title" className="text-lg font-semibold text-slate-950">
          Submit your test?
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#1e5fdc]">
          परीक्षा बुझाउनुहुन्छ?
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You have {unansweredCount} unanswered{" "}
          {unansweredCount === 1 ? "question" : "questions"}. Your result will
          show immediately, and you can review every answer.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {unansweredCount} प्रश्न बाँकी छ। नतिजा तुरुन्त देखिन्छ।
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
          >
            Keep working
            <span className="block text-[10px] font-semibold">
              अझै जारी राख्नुहोस्
            </span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 rounded-2xl bg-[#1e5fdc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#174db8] focus:outline-none focus:ring-2 focus:ring-[#1e5fdc]/40"
          >
            Submit test
            <span className="block text-[10px] font-semibold">
              परीक्षा बुझाउनुहोस्
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
