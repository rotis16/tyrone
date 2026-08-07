export type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type OptionListProps<T extends string> = {
  options: Option<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
};

export default function OptionList<T extends string>({
  options,
  selected,
  onSelect,
}: OptionListProps<T>) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`text-left rounded-xl border px-4 py-3.5 transition-colors cursor-pointer ${
              isSelected
                ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
                : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            }`}
          >
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {opt.label}
            </div>
            {opt.description && (
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {opt.description}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
