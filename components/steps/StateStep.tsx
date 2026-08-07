"use client";

import { US_STATES } from "@/data/states";

type StateStepProps = {
  value: string | null;
  onSelect: (code: string) => void;
};

export default function StateStep({ value, onSelect }: StateStepProps) {
  return (
    <div>
      <select
        value={value ?? ""}
        onChange={(e) => {
          if (e.target.value) onSelect(e.target.value);
        }}
        className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-base text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          Select your state…
        </option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
        We use this only to check state laws about copay assistance. It stays in your browser
        like everything else here.
      </p>
    </div>
  );
}
