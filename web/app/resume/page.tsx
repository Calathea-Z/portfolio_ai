import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Resume · Zach Sykes",
  description: "Traditional resume view with linked PDF and Word versions.",
};

export default function ResumePage() {
  const resumePdf = process.env.NEXT_PUBLIC_RESUME_PDF_URL?.trim();
  const hasResumePdf = Boolean(resumePdf);
  const primaryResumeHref = hasResumePdf ? resumePdf : "/Sykes_Zach_Resume_2026_Default.docx";
  const primaryResumeLabel = hasResumePdf ? "Download resume (.pdf)" : "Download resume (.docx)";

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
              href={primaryResumeHref}
              download
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] transition-all hover:bg-primary-hover hover:shadow-[0_6px_20px_rgb(124_92_255/0.35)] dark:shadow-[0_4px_14px_rgb(184_165_255/0.25)] dark:hover:shadow-[0_6px_20px_rgb(184_165_255/0.35)]"
            >
              {primaryResumeLabel}
            </a>
            {hasResumePdf ? (
              <a
                href="/Sykes_Zach_Resume_2026_Default.docx"
                download
                className="rounded-lg border border-border-soft bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary/60 hover:bg-surface-alt"
              >
                Download (.docx)
              </a>
            ) : null}
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
          <ul className="mt-4 space-y-4 text-sm text-text/90">
            <li>
              <p className="font-medium text-text">Calathea Web Design (freelance) · Next.js + TypeScript + Stripe</p>
              <p className="mt-1">
                Built and launched marketing and e-commerce sites end-to-end for small-business clients, including
                architecture, implementation, deployment, and iteration with direct client feedback.{" "}
                <a
                  href="https://www.calathea.design/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  www.calathea.design
                </a>
                .
              </p>
            </li>
            <li>
              <p className="font-medium text-text">Planning Poker platform · React + .NET 8 + WebSockets + Azure</p>
              <p className="mt-1">
                Designed and shipped a real-time internal estimation tool for distributed teams; delivered reliable
                live collaboration and production deployment with observability.
              </p>
            </li>
            <li>
              <p className="font-medium text-text">This portfolio chat app · Next.js 16 + ASP.NET Core + Anthropic</p>
              <p className="mt-1">
                Implemented a streaming resume-grounded assistant with API validation, per-IP abuse protection, and
                responsive UX optimized for recruiter evaluation workflows.
              </p>
            </li>
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
            api/Portfolio.Api/Prompts/chat.md
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
