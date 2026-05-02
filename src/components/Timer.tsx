"use client";

type TimerProps = {
  seconds: number;
};

export function Timer({ seconds }: TimerProps) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  const urgent = seconds <= 120;

  return (
    <div
      className={`rounded-md border px-3 py-1.5 font-mono text-sm font-semibold ${
        urgent
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-50 text-slate-800"
      }`}
      aria-live="polite"
    >
      {minutes}:{remainingSeconds}
    </div>
  );
}
