import Link from "next/link";
import Overview from "@/components/Overview";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-lg space-y-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Your labs</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Saved on this device only.
          </p>
        </div>
        <Link
          href="/settings"
          className="shrink-0 text-sm text-blue-700 hover:underline dark:text-blue-400"
        >
          Your data
        </Link>
      </header>

      <Overview />

      <Link
        href="/add"
        className="block rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white hover:bg-blue-700"
      >
        Add a lab report
      </Link>

      <p className="border-t border-neutral-200 pt-4 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
        This is educational information only, not medical advice, not a diagnosis, and does not
        replace a licensed clinician. This app does not detect medical emergencies or urgent
        findings — any concern about a result should go to a doctor.
      </p>
    </main>
  );
}
