import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Resume · Zach Sykes",
  description: "Traditional resume view — download the Word file from /public when needed.",
};

export default function ResumePage() {
  return (
    <div className="relative min-h-full bg-bg text-text">
      <BackgroundOrbs />
      <header className="sticky top-0 z-10 border-b border-border-soft bg-surface/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            ← Back to chat
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="/Sykes_Zach_Resume_2026_Default.docx"
              download
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] transition-all hover:bg-primary-hover hover:shadow-[0_6px_20px_rgb(124_92_255/0.35)] dark:shadow-[0_4px_14px_rgb(184_165_255/0.25)] dark:hover:shadow-[0_6px_20px_rgb(184_165_255/0.35)]"
            >
              Download resume (.docx)
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-text">Zach Sykes</h1>
          <p className="mt-2 text-lg text-muted">Full-stack engineer · Denver, CO (remote-first)</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text/90">
            Full-stack software engineer with 3+ years in professional engineering and 5+ years building production
            software—after about a decade of kitchen operations leadership. Day-to-day: React/Next.js/TypeScript and
            .NET 8 on Azure, end-to-end ownership from architecture through deployment and monitoring. Prefer teams that
            value clear communication, mentoring, and maintainable systems.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
            Experience
          </h2>
          <ul className="mt-4 space-y-6 text-sm leading-relaxed text-text/90">
            <li>
              <p className="font-medium text-text">Full Stack Software Engineer</p>
              <p className="text-muted">Forvis Mazars (remote) · June 2023–present</p>
              <p className="mt-2">
                Production web apps and APIs for enterprise users; React, TypeScript, Next.js, .NET 8; shipped a
                real-time internal Planning Poker platform (WebSockets, Azure); CI/CD and observability (GitHub
                Actions, Azure Pipelines, Grafana, Application Insights); integrations and mentoring.
              </p>
            </li>
            <li>
              <p className="font-medium text-text">Kitchen Manager (from line cook)</p>
              <p className="text-muted">Asheville Pizza &amp; Brewing Company · 2012–2022</p>
              <p className="mt-2">
                High-volume operations: team leadership (40+ people), scheduling, cost and workflow improvements—same
                discipline around clarity and reliability Zach applies in engineering.
              </p>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
            Selected projects
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-text/90 marker:text-primary/70">
            <li>
              <span className="font-medium text-text">Calathea Web Design</span> (freelance,
              calathea.design, 2024–present) — client sites and e-commerce with Next.js, TypeScript, and full-stack
              delivery.
            </li>
            <li>This portfolio — Next.js UI, .NET streaming API, Claude system prompt.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
            Skills
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text/90">
            React, Next.js, TypeScript, Tailwind, Blazor, C# / .NET 8, ASP.NET Core, REST, EF Core, Node.js, PostgreSQL,
            SQL Server, Azure, Vercel, GitHub Actions, Docker, testing with xUnit/Moq, Git.
          </p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
            Education
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text/90">
            Software Engineering Bootcamp — General Assembly
          </p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
            Looking for
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text/90">
            Remote-first teams with strong async communication and trust—roles with meaningful full-stack ownership and
            healthy engineering culture.
          </p>
        </section>

        <p className="text-xs text-muted">
          Canonical facts for the chat assistant live in{" "}
          <code className="rounded bg-surface-alt px-1 text-text/90">
            api/Portfolio.Api/Prompts/system-prompt.txt
          </code>
          . Source resume file:{" "}
          <code className="rounded bg-surface-alt px-1 text-text/90">
            web/public/Sykes_Zach_Resume_2026_Default.docx
          </code>
          .
        </p>
      </main>
    </div>
  );
}
