import Overview from "@/components/Overview";

export default function Home() {
  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Your labs</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Demo data — the real upload and extraction flow isn&apos;t built yet (see README). This is
          what the tracking, charting, and explanation layers look like once it is.
        </p>
      </header>
      <Overview />
      <p className="text-xs text-neutral-500 dark:text-neutral-500 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        This is educational information only, not medical advice, not a diagnosis, and does not
        replace a licensed clinician. This app does not detect medical emergencies or urgent
        findings — any concern about a result should go to a doctor.
      </p>
    </main>
  );
}
