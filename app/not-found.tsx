import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-white">
      <div className="max-w-xl rounded-surface border border-white/10 bg-white/[0.025] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sequence-orange">Sequence BioLab</p>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em]">Report page not found</h1>
        <p className="mt-4 text-zinc-400">Return to the integrated biomechanics report.</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-surface border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
        >
          Back to Report
        </Link>
      </div>
    </main>
  );
}
