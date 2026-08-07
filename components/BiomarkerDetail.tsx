import { findBiomarkerContent } from "@/data/biomarkerContent";
import { FIXTURE_REPORTS, resultsFor } from "@/lib/fixtures";
import { changeSinceLast, positionInRange } from "@/lib/trend";
import BiomarkerChart from "./BiomarkerChart";

export default function BiomarkerDetail({ biomarkerKey }: { biomarkerKey: string }) {
  const content = findBiomarkerContent(biomarkerKey);
  const results = resultsFor(biomarkerKey).sort((a, b) => {
    const ra = FIXTURE_REPORTS.find((r) => r.id === a.reportId)?.collectionDate ?? "";
    const rb = FIXTURE_REPORTS.find((r) => r.id === b.reportId)?.collectionDate ?? "";
    return ra.localeCompare(rb);
  });
  const latest = results[results.length - 1];
  if (!latest) return null;

  const latestReport = FIXTURE_REPORTS.find((r) => r.id === latest.reportId);
  const position = positionInRange(latest.value, latest.referenceLow, latest.referenceHigh);
  const change = changeSinceLast(
    results.map((r) => {
      const report = FIXTURE_REPORTS.find((rep) => rep.id === r.reportId);
      return { date: report?.collectionDate ?? "", value: r.normalizedValue ?? r.value, unit: r.normalizedUnit ?? r.unit };
    })
  );

  return (
    <article className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold">{content?.displayName ?? latest.rawLabel}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Latest: {latest.value} {latest.unit}
          {latestReport ? ` · ${new Date(latestReport.collectionDate).toLocaleDateString("en-US", { timeZone: "UTC" })} · ${latestReport.labName}` : ""}
        </p>
      </header>

      {position && (
        <p className="text-sm">
          This result is <strong>{position.label}</strong>
          {latest.referenceLow !== null && latest.referenceHigh !== null
            ? ` (${latest.referenceLow}–${latest.referenceHigh} ${latest.unit}, as printed by this lab).`
            : "."}
        </p>
      )}
      {!position && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          This lab didn&apos;t print a reference range for this result, so none is shown here.
        </p>
      )}

      {change && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {change.direction === "flat"
            ? "Unchanged"
            : `${change.direction === "up" ? "Up" : "Down"} ${change.delta.toFixed(2)} ${change.unit}`}{" "}
          since {new Date(change.fromDate).toLocaleDateString("en-US", { timeZone: "UTC" })}.
        </p>
      )}

      <BiomarkerChart results={results} reports={FIXTURE_REPORTS} displayUnit={latest.normalizedUnit ?? latest.unit} />

      {content ? (
        <div className="space-y-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <section>
            <h2 className="font-medium mb-1">What this measures</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{content.whatItMeasures}</p>
          </section>
          <section>
            <h2 className="font-medium mb-1">Why it&apos;s typically ordered</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{content.whyOrdered}</p>
          </section>
          <section>
            <h2 className="font-medium mb-1">Known to affect this value</h2>
            <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300 space-y-0.5">
              {content.whatMovesIt.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-medium mb-1">Questions worth asking your doctor</h2>
            <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300 space-y-0.5">
              {content.questionsForDoctor.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </section>
          <section className="text-xs text-neutral-500 dark:text-neutral-500 space-y-1">
            <p>
              Sources:{" "}
              {content.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ", "}
                  <a className="underline" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </span>
              ))}
              {" · "}Last reviewed {content.lastReviewed}
              {content.reviewStatus !== "clinician_reviewed" && " · drafted by AI against these sources, not yet reviewed by a clinician"}
            </p>
          </section>
        </div>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          We don&apos;t have an explanation for this one yet — showing the value and trend only.
        </p>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-500 border-t border-neutral-200 dark:border-neutral-800 pt-4">
        This is educational information only, not medical advice, not a diagnosis, and does not
        replace a licensed clinician. This app does not detect medical emergencies or urgent
        findings — any concern about a result should go to a doctor.
      </p>
    </article>
  );
}
