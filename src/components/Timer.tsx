"use client";

type TimerProps = {
  seconds: number;
};

export function Timer({ seconds }: TimerProps) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  const urgent = seconds <= 60;
  const warning = seconds <= 300 && !urgent;

  return (
    <div
      className={`rounded-md border px-2.5 py-1.5 text-right ${
        urgent
          ? "border-red-200 bg-red-50 text-red-700"
          : warning
            ? "border-yellow-200 bg-yellow-50 text-yellow-800"
          : "border-[#1e5fdc]/20 bg-[#1e5fdc]/10 text-[#1e5fdc]"
      }`}
      aria-live="polite"
    >
      <span className="block text-[10px] font-semibold uppercase tracking-wide">
        Time left
      </span>
      <span className="block text-[10px] font-semibold">बाँकी समय</span>
      <span className="block font-mono text-sm font-semibold">
        {minutes}:{remainingSeconds}
      </span>
    </div>
  );
}
