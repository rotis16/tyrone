type ProgressBarProps = {
  step: number;
  total: number;
};

export default function ProgressBar({ step, total }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((step / total) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
        <span>
          Question {step} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
