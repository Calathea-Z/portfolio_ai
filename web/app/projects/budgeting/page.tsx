import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

const project = getProject("budgeting")!;

export const metadata: Metadata = {
  title: `${project.title} · ${siteConfig.name}`,
  description: project.blurb,
};

const techTags = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "C#",
  ".NET",
  "PostgreSQL",
  "Plaid",
  "Clerk",
];

export default function BudgetingProjectPage() {
  return (
    <div className="relative min-h-screen w-full text-text">
      <BackgroundOrbs />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
            <Link
              href="/#now"
              className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              ← Back to portfolio
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <section aria-labelledby="project-heading">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Currently working on
            </p>
            <h1
              id="project-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl"
            >
              {project.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-secondary">
              <span className="font-medium text-primary">At a glance:</span> {project.capability}
            </p>
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-secondary">{project.blurb}</p>
            <p className="mt-4 inline-flex rounded-full border border-info-border bg-info-bg px-3 py-1 text-xs font-medium text-info-fg">
              Private — in progress, no public demo or repository
            </p>
          </section>

          <section
            aria-labelledby="problem"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="problem" className="text-xl font-semibold tracking-tight text-text">
              What it is
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              A personal project I am spending my time on. It helps people budget and manage debt
              from the same records they use day to day: what is owed, what is coming in, which
              bills repeat, and what a payment does to the month. It is not a public demo yet.
            </p>
          </section>

          <section
            aria-labelledby="product"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="product" className="text-xl font-semibold tracking-tight text-text">
              What is in the product now
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-secondary">
              <li>
                Signed-in household records: home, accounts, transactions, institutions, categories,
                budgets, income, bills, and debts.
              </li>
              <li>
                Manual accounts and transactions, plus CSV import, so the app is usable before a
                bank is connected.
              </li>
              <li>
                Income covers sources, paycheck schedules, and scenarios. Bills include recurring
                suggestions. Debts have a summary for recorded balances, this month&apos;s interest,
                minimums, and utilization of known credit limits.
              </li>
              <li>
                A connected card or loan can be compared with the debt&apos;s recorded balance. The
                next slice is letting a manual debt follow that synced balance instead of asking for
                a retype after every payment.
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="tech-stack"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="tech-stack" className="text-xl font-semibold tracking-tight text-text">
              Tech stack
            </h2>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono">
              {techTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border-subtle bg-surface-alt px-2 py-0.5 text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="architecture"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="architecture" className="text-xl font-semibold tracking-tight text-text">
              Architecture
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              The Next.js app talks to an ASP.NET Core API. Financial reads and writes use the
              household resolved on the server for the signed-in owner. PostgreSQL holds the
              records through Entity Framework Core. Plaid credentials are optional: without them,
              manual records and CSV import still work, and bank linking stays off. A separate
              worker runs one synchronization pass and exits. Plaid access tokens are encrypted
              before they are stored.
            </p>
          </section>

          <section
            aria-labelledby="why"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="why" className="text-xl font-semibold tracking-tight text-text">
              Why it is on this site
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              This is the personal project I am spending my time on. It is a workflow-heavy
              application with a typed API, a real database, sign-in, and a careful boundary around
              bank data. The repository stays private, so this page is the public description.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
