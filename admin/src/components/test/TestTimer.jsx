export default function TestTimer({ secondsLeft }) {
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const urgent = secondsLeft <= 60;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center ${
        urgent
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
          : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      }`}
    >
      <p className="text-xs uppercase tracking-wide">Time Left</p>
      <p className="text-2xl font-semibold tabular-nums">
        {minutes}:{seconds}
      </p>
    </div>
  );
}
