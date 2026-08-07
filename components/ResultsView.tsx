"use client";

import { useMemo } from "react";
import { getMoves } from "@/lib/rules";
import type { Answers } from "@/lib/types";
import { DRUGS } from "@/data/drugs";
import MoveCard from "./MoveCard";

export default function ResultsView({
  answers,
  onStartOver,
}: {
  answers: Answers;
  onStartOver: () => void;
}) {
  const moves = useMemo(() => getMoves(answers), [answers]);
  const drug = useMemo(
    () => (answers.drugId ? DRUGS.find((d) => d.id === answers.drugId) : undefined),
    [answers.drugId]
  );

  const drugLabel = drug?.brandName || answers.drugQuery || "your prescription";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Your plan for {drugLabel}
        </h1>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Ranked by how much it&apos;s likely to help and how fast you can act. Start at the top.
      </p>

      {drug && (
        <div className="mt-4 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
          {drug.brandName} ({drug.genericName}) is typically {drug.typicalTier} on commercial
          plans, but check your own formulary — every plan is different.
          {drug.notes && <span> {drug.notes}</span>}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {moves.map((move) => (
          <MoveCard key={move.rank} move={move} />
        ))}
      </div>

      <button
        type="button"
        onClick={onStartOver}
        className="mt-8 text-sm text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
      >
        Start over with a different prescription
      </button>
    </div>
  );
}
