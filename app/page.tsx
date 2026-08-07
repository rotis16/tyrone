export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">Lab Intelligence</h1>
      <p className="max-w-md text-neutral-600 dark:text-neutral-400">
        Data model, unit normalization, and the biomarker content library are built and tested.
        The upload/extraction/confirmation UI is next, pending an infrastructure decision (hosting,
        extraction API, storage) — see the project README.
      </p>
    </main>
  );
}
