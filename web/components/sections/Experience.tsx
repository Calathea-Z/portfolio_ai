import Link from "next/link";
import { sectionIds } from "@/lib/site-config";

type TimelineEntry = {
  title: string;
  org: string;
  orgUrl?: string;
  period: string;
  body: string;
  secondary?: boolean;
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
    title: "Freelance Full Stack Engineer",
    org: "Calathea Web Design · Selected client work (remote)",
    orgUrl: "https://www.calathea.design/",
    period: "2024 – present",
    body: "Part-time freelance practice outside full-time engineering work. Production websites and e-commerce for small-business clients — from discovery through deployment. Own UI/UX, implementation, backend integrations, custom CMS creation when clients need tailored editorial workflows, and hosting on Vercel.",
  },
  {
    title: "Kitchen Manager",
    org: "Asheville Pizza and Brewing Company",
    period: "2012 – 2022",
    body: "Earlier career: led kitchen operations for a 40+ person team, including hiring, onboarding, training, scheduling, and performance management.",
    secondary: true,
  },
  {
    title: "Software Engineering Bootcamp",
    org: "General Assembly",
    period: "Graduated",
    body: "Career change from operations leadership into software engineering.",
    secondary: true,
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
            <li
              key={`${entry.org}-${idx}`}
              className={`relative ${entry.secondary ? "opacity-80" : ""}`}
            >
              <span
                aria-hidden="true"
                className={`absolute -left-[1.6rem] top-2 h-3 w-3 rounded-full border-2 bg-bg ${
                  entry.secondary ? "border-border-soft" : "border-primary/70"
                }`}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3
                  className={`font-semibold tracking-tight text-text ${
                    entry.secondary ? "text-sm" : "text-base"
                  }`}
                >
                  {entry.title}
                </h3>
                <p
                  className={`font-medium uppercase tracking-widest text-muted ${
                    entry.secondary ? "text-[10px]" : "text-xs"
                  }`}
                >
                  {entry.period}
                </p>
              </div>
              <p
                className={`font-medium ${entry.secondary ? "text-xs text-muted" : "text-sm text-primary"}`}
              >
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
              <p
                className={`mt-2 leading-relaxed ${
                  entry.secondary ? "text-xs text-muted" : "text-sm text-secondary"
                }`}
              >
                {entry.body}
              </p>
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
