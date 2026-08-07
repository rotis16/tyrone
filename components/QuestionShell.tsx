import type { ReactNode } from "react";
import ProgressBar from "./ProgressBar";

type QuestionShellProps = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
};

export default function QuestionShell({
  step,
  total,
  title,
  subtitle,
  onBack,
  children,
}: QuestionShellProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <ProgressBar step={step} total={total} />

      <div className="mt-6 mb-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
          >
            <span aria-hidden>&larr;</span> Back
          </button>
        ) : (
          <div className="h-5" />
        )}
      </div>

      <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
      )}

      <div className="mt-6">{children}</div>
    </div>
  );
}
