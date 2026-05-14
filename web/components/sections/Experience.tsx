import Link from "next/link";
import { sectionIds } from "@/lib/site-config";

type TimelineEntry = {
  title: string;
  org: string;
  /** External site for the org (e.g. freelance practice). */
  orgUrl?: string;
  period: string;
  body: string;
};

// Phase 7 swaps this inline list for the structured resume.json source.
const timeline: TimelineEntry[] = [
  {
    title: "Full Stack Software Engineer",
    org: "Forvis Mazars (remote)",
    period: "June 2023 – present",
    body: "Build and maintain production web applications and APIs serving enterprise users — owning architecture, delivery, reliability, and operational health across the full stack. Highlights: end-to-end React/TypeScript/Next.js/.NET delivery; Planning Poker (WebSockets) from 0 to 1; shared component systems and API patterns across teams; CI/CD and observability (GitHub Actions, Azure Pipelines, Grafana, Application Insights); stakeholder collaboration, mentoring, and AI-augmented workflows (Copilot, Claude).",
  },
  {
    title: "Founder / Full Stack Engineer",
    org: "Calathea Web Design (remote)",
    orgUrl: "https://www.calathea.design/",
    period: "2024 – present",
    body: "Freelance practice building production websites and e-commerce for small-business clients — from discovery through deployment. Own UI/UX, implementation, backend integrations, custom CMS creation when clients need tailored editorial workflows, and hosting on Vercel; the practice site is a shipped Next.js app at the same quality bar as client work.",
  },
  {
    title: "Kitchen Manager",
    org: "Asheville Pizza and Brewing Company",
    period: "2012 – 2022",
    body: "Progressed from line cook to Kitchen Manager. Led daily operations, team management, and process improvement in a high-volume environment — including a 40+ person team across hiring, onboarding, training, scheduling, and performance management.",
  },
  {
    title: "Software Engineering Bootcamp",
    org: "General Assembly",
    period: "Graduated",
    body: "Career change from operations leadership into software engineering.",
  },
];

export function Experience() {
  return (
    <section
      id={sectionIds.experience}
      aria-labelledby="experience-heading"
      className="scroll-mt-24 border-t border-border-subtle"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Experience
        </p>
        <h2
          id="experience-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          Career so far.
        </h2>

        <ol className="mt-10 space-y-8 border-l border-border-subtle pl-6">
          {timeline.map((entry, idx) => (
            <li key={`${entry.org}-${idx}`} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[1.6rem] top-2 h-3 w-3 rounded-full border-2 border-primary/70 bg-bg"
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold tracking-tight text-text">
                  {entry.title}
                </h3>
                <p className="text-xs font-medium uppercase tracking-widest text-muted">
                  {entry.period}
                </p>
              </div>
              <p className="text-sm font-medium text-primary">
                {entry.orgUrl ? (
                  <Link
                    href={entry.orgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 transition-colors hover:underline"
                  >
                    {entry.org}
                  </Link>
                ) : (
                  entry.org
                )}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{entry.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-sm text-muted">
          The{" "}
          <Link
            href="/resume"
            className="text-primary underline-offset-4 transition-colors hover:underline"
          >
            traditional resume
          </Link>{" "}
          page has the print-friendly layout and download.
        </p>
      </div>
    </section>
  );
}
