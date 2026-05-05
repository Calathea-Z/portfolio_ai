import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume · Zach",
  description: "Traditional resume view — PDF always available.",
};

export default function ResumePage() {
  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-medium text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-400">
            ← Back to chat
          </Link>
          <a
            href="/resume.pdf"
            download
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            Download PDF
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">Zach</h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">Full-stack developer · Remote since 2023</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            Kitchen-trained, systems-minded engineer. Day-to-day: DITA/XML pipelines, web surfaces, and the tooling
            that keeps technical content honest and shippable. Prefer async remote teams that treat platforms as
            product work.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
            Experience
          </h2>
          <ul className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            <li>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">Full-stack developer (remote)</p>
              <p className="text-zinc-600 dark:text-zinc-400">2023–present · DITA/XML pipelines, internal tooling, React and .NET services.</p>
            </li>
            <li>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">Prior: kitchen leadership</p>
              <p className="text-zinc-600 dark:text-zinc-400">
                High-pressure service and management — informs how I run incidents, scope, and communication.
              </p>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
            Selected projects
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-zinc-800 dark:text-zinc-200">
            <li>DITA/XML publishing pipeline — transforms, validation, operator tooling.</li>
            <li>Internal admin surfaces — React, Tailwind, pragmatic auth and contracts.</li>
            <li>This portfolio — Next.js UI + .NET 8 streaming API + Claude system prompt.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
            Skills
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            TypeScript, React, Tailwind, .NET, HTTP APIs, XML/DITA, Git, systems design. Prefer strict typing, small
            modules, and boring infrastructure that stays out of the way.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
            Looking for
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            Remote-first teams with high trust and clear writing. Roles that touch both product UI and the pipelines
            behind it. Companies that invest in internal platforms and content systems—not only growth experiments.
          </p>
        </section>

        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Canonical narrative for tone and detail lives in the chat system prompt under <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">api/</code>.
          Add <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">web/public/resume.pdf</code> when you have a PDF export.
        </p>
      </main>
    </div>
  );
}
