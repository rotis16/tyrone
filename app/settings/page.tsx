"use client";

import Link from "next/link";
import { useState } from "react";
import ReportList from "@/components/ReportList";
import { deleteEverything, exportAll } from "@/lib/db";
import { useLabData } from "@/lib/store";

export default function SettingsPage() {
  const { reports, results, loading, reload } = useLabData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleExport() {
    const bundle = await exportAll();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab-intelligence-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Exported.");
  }

  async function handleDeleteAll() {
    await deleteEverything();
    setConfirmingDelete(false);
    setStatus("Everything has been deleted from this device.");
    reload();
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-700 hover:underline dark:text-blue-400">
        ← Back
      </Link>

      <h1 className="mt-6 text-xl font-semibold">Your data</h1>

      <section className="mt-6 space-y-2">
        <h2 className="font-medium">Where your results live</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Everything you save is stored on this device, in this browser. There is no account and no
          copy on a server — which also means results won&apos;t appear on your other devices, and
          clearing your browser storage will delete them. Export a copy if you want a backup.
        </p>
        {!loading && (
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Currently stored: {reports.length} {reports.length === 1 ? "report" : "reports"},{" "}
            {results.length} {results.length === 1 ? "result" : "results"}.
          </p>
        )}
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="font-medium">When you upload a file</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          To read a PDF or photo, the file is sent to an extraction service (the Anthropic API) and
          then discarded — it isn&apos;t stored there and isn&apos;t used to train anything. If you
          prefer not to send a file at all, you can type results in by hand instead. The original
          file is not kept on this device unless you tick the box for it while saving.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-medium">Saved reports</h2>
        {!loading && <ReportList reports={reports} results={results} onChange={reload} />}
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="font-medium">Export</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Download everything as a JSON file you can keep or move elsewhere.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Export my data
        </button>
      </section>

      <section className="mt-8 space-y-3 rounded-xl border border-red-300 p-4 dark:border-red-900">
        <h2 className="font-medium">Delete everything</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Permanently removes every report, result, and retained file from this device. This
          can&apos;t be undone, and there&apos;s no server copy to restore from.
        </p>
        {confirmingDelete ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDeleteAll}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Yes, delete everything
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg border border-red-400 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Delete everything
          </button>
        )}
      </section>

      {status && (
        <p role="status" className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          {status}
        </p>
      )}
    </main>
  );
}
