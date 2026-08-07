import type { Move } from "@/lib/types";
import ScriptBlock from "./ScriptBlock";

const IMPACT_STYLE: Record<Move["potentialImpact"], string> = {
  high: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  low: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
};

export default function MoveCard({ move }: { move: Move }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-semibold">
          {move.rank}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-balance">
            {move.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${IMPACT_STYLE[move.potentialImpact]}`}>
              {move.potentialImpact} impact
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              do this {move.effort}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {move.why}
      </p>

      {move.caveat && (
        <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-500">
          <span className="font-medium">Watch out: </span>
          {move.caveat}
        </p>
      )}

      {move.script && <ScriptBlock script={move.script} />}
    </div>
  );
}
