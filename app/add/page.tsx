"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import ConfirmTable from "@/components/ConfirmTable";
import { newId, saveReport, saveSourceFile } from "@/lib/db";
import type { ExtractionResponse } from "@/lib/extractionSchema";
import {
  aggregateConfidence,
  emptyDraftRow,
  normalizeValue,
  toDraftRows,
  type DraftRow,
} from "@/lib/intake";
import type { BiomarkerResult, LabReport } from "@/lib/types";

type Step = "choose" | "extracting" | "confirm";

export default function AddReportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [collectionDate, setCollectionDate] = useState("");
  const [labName, setLabName] = useState("");
  const [orderingProvider, setOrderingProvider] = useState("");
  const [sourceFilename, setSourceFilename] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [retainSourceFile, setRetainSourceFile] = useState(false); // defaults to delete, per spec
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setSourceFilename(file.name);
    setPendingFile(file);
    setStep("extracting");

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/extract", { method: "POST", body });
      if (!res.ok) {
        const detail = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(detail?.error ?? "Extraction didn't work. You can enter the results by hand instead.");
        setRows([emptyDraftRow()]);
        setStep("confirm");
        return;
      }
      const data = (await res.json()) as ExtractionResponse;
      setCollectionDate(data.collectionDate ?? "");
      setLabName(data.labName ?? "");
      setOrderingProvider(data.orderingProvider ?? "");
      const drafts = toDraftRows(data);
      setRows(drafts.length > 0 ? drafts : [emptyDraftRow()]);
      setStep("confirm");
    } catch {
      setError("Couldn't reach the extraction service. You can enter the results by hand instead.");
      setRows([emptyDraftRow()]);
      setStep("confirm");
    }
  }

  function startManual() {
    setError(null);
    setPendingFile(null);
    setSourceFilename("Entered by hand");
    setRows([emptyDraftRow()]);
    setStep("confirm");
  }

  async function handleSave() {
    const included = rows.filter((r) => r.include && r.rawLabel.trim() !== "");
    if (included.length === 0) {
      setError("Add at least one result before saving.");
      return;
    }
    if (!collectionDate) {
      setError("Enter the date the blood was drawn — that's what the timeline is built on.");
      return;
    }

    setSaving(true);
    setError(null);

    const reportId = newId();
    const report: LabReport = {
      id: reportId,
      sourceFilename: sourceFilename || "Untitled",
      collectionDate,
      labName: labName.trim() || null,
      orderingProvider: orderingProvider.trim() || null,
      extractionConfidence: aggregateConfidence(rows),
      userConfirmed: true,
      createdAt: new Date().toISOString(),
    };

    const results: BiomarkerResult[] = included.map((row) => {
      const { normalizedValue, normalizedUnit } = normalizeValue(row.biomarkerKey, row.value, row.unit);
      return {
        id: newId(),
        reportId,
        biomarkerKey: row.biomarkerKey,
        rawLabel: row.rawLabel.trim(),
        value: row.value,
        unit: row.unit ?? "",
        normalizedValue,
        normalizedUnit,
        referenceLow: row.referenceLow,
        referenceHigh: row.referenceHigh,
        flagAsPrinted: row.flagAsPrinted,
        extractionConfidence: row.extractionConfidence,
        userCorrected: row.userCorrected,
      };
    });

    try {
      await saveReport(report, results);
      if (retainSourceFile && pendingFile) {
        const buffer = await pendingFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        await saveSourceFile({
          reportId,
          filename: pendingFile.name,
          mediaType: pendingFile.type,
          data: base64,
        });
      }
      router.push("/");
    } catch {
      setError("Couldn't save to this device's storage. Your browser may be blocking it.");
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-700 hover:underline dark:text-blue-400">
        ← Back
      </Link>

      {step === "choose" && (
        <div className="mt-6">
          <h1 className="text-xl font-semibold">Add a lab report</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Upload a PDF or a photo and we&apos;ll pull out the numbers for you to check — or enter
            them by hand.
          </p>

          <label className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed border-neutral-300 p-8 text-center hover:border-blue-500 dark:border-neutral-700">
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <span className="font-medium text-blue-700 dark:text-blue-400">Choose a file</span>
            <span className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">
              PDF or photo, up to 12 MB
            </span>
          </label>

          <button
            type="button"
            onClick={startManual}
            className="mt-4 text-sm text-blue-700 hover:underline dark:text-blue-400"
          >
            Or enter results by hand
          </button>

          <p className="mt-6 rounded-lg bg-neutral-100 p-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
            Your file is sent to an extraction service to be read, then discarded — it isn&apos;t
            stored there. The extracted results are saved only on this device.
          </p>
        </div>
      )}

      {step === "extracting" && (
        <div className="mt-6">
          <h1 className="text-xl font-semibold">Reading your report…</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            This usually takes a few seconds. You&apos;ll get to check every number before anything
            is saved.
          </p>
        </div>
      )}

      {step === "confirm" && (
        <div className="mt-6">
          <h1 className="text-xl font-semibold">Check these before saving</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Compare each row against your report and fix anything that&apos;s off. Highlighted rows
            are the ones worth looking at closely. Nothing is saved until you press Save.
          </p>

          {error && (
            <p className="mt-4 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              {error}
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Date blood was drawn</span>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>
            <label className="text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Lab</span>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="e.g. Quest"
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>
            <label className="text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Ordered by</span>
              <input
                type="text"
                value={orderingProvider}
                onChange={(e) => setOrderingProvider(e.target.value)}
                placeholder="Optional"
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>
          </div>

          <div className="mt-5">
            <ConfirmTable rows={rows} onChange={setRows} />
          </div>

          <button
            type="button"
            onClick={() => setRows([...rows, emptyDraftRow()])}
            className="mt-3 text-sm text-blue-700 hover:underline dark:text-blue-400"
          >
            + Add another row
          </button>

          {pendingFile && (
            <label className="mt-6 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={retainSourceFile}
                onChange={(e) => setRetainSourceFile(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span className="text-neutral-600 dark:text-neutral-400">
                Keep the original file on this device. Off by default — the numbers above are saved
                either way.
              </span>
            </label>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save to my timeline"}
          </button>
        </div>
      )}
    </main>
  );
}
