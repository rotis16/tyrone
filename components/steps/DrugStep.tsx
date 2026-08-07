"use client";

import { useMemo, useState } from "react";
import { DRUGS, searchDrugs, type Drug } from "@/data/drugs";

type DrugStepProps = {
  initialQuery: string;
  onContinue: (result: { drugId: string | null; drugQuery: string; drugUnknown: boolean }) => void;
};

export default function DrugStep({ initialQuery, onContinue }: DrugStepProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<Drug | null>(null);
  const [showAll, setShowAll] = useState(false);

  const suggestions = useMemo(() => {
    if (selected) return [];
    return searchDrugs(query).slice(0, 6);
  }, [query, selected]);

  function pick(drug: Drug) {
    setSelected(drug);
    setQuery(drug.brandName);
  }

  function handleTypedContinue() {
    if (selected) {
      onContinue({ drugId: selected.id, drugQuery: selected.brandName, drugUnknown: false });
      return;
    }
    const trimmed = query.trim();
    if (!trimmed) return;
    onContinue({ drugId: null, drugQuery: trimmed, drugUnknown: true });
  }

  function handleDontKnow() {
    onContinue({ drugId: null, drugQuery: "", drugUnknown: true });
  }

  const canContinue = selected !== null || query.trim().length > 0;
  const showUnmatchedHint =
    !selected && query.trim().length > 1 && suggestions.length === 0;

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setSelected(null);
            setQuery(e.target.value);
          }}
          placeholder="Start typing a brand or generic name…"
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {suggestions.length > 0 && (
          <ul className="mt-1 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
            {suggestions.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => pick(d)}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {d.brandName}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {" "}
                    ({d.genericName})
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {showUnmatchedHint && (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-500">
            We don&apos;t have data on this one yet — you can still continue and we&apos;ll give
            you insurance-based guidance that doesn&apos;t depend on the specific drug.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleTypedContinue}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-blue-700 cursor-pointer"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={handleDontKnow}
          className="text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
        >
          I don&apos;t know the exact name
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAll((s) => !s)}
        className="mt-6 text-sm text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
      >
        {showAll ? "Hide full drug list" : "Browse the full seeded drug list"}
      </button>
      {showAll && (
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {DRUGS.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => pick(d)}
                className="w-full text-left rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer"
              >
                {d.brandName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
