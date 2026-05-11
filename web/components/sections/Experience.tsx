import Link from "next/link";
import { sectionIds } from "@/lib/site-config";

type TimelineEntry = {
  title: string;
  org: string;
  period: string;
  body: string;
};

// Phase 7 swaps this inline list for the structured resume.json source.
const timeline: TimelineEntry[] = [
  {
    title: "Full Stack Software Engineer",
    org: "Forvis Mazars (remote)",
    period: "June 2023 – present",
    body: "Production web apps and APIs for enterprise users. React, TypeScript, Next.js, .NET 8 on Azure. Shipped a real-time internal Planning Poker platform (WebSockets, Azure). CI/CD and observability with GitHub Actions, Azure Pipelines, Grafana, Application Insights. Integrations and mentoring.",
  },
  {
    title: "Founder / Freelance Engineer",
    org: "Calathea Web Design",
    period: "2024 – present",
    body: "Solo practice building production marketing and e-commerce sites for small-business clients end-to-end — requirements through deployment. Next.js, TypeScript, Stripe.",
  },
  {
    title: "Head Chef / Kitchen Manager (from line cook)",
    org: "Asheville Pizza & Brewing Company",
    period: "2012 – 2022",
    body: "Roughly a decade in high-volume kitchens, moving into leadership of 40+ person teams. Hiring, scheduling, cost and workflow improvements — the same clarity-and-reliability discipline I apply to production engineering today.",
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
      className="scroll-mt-24 border-t border-border-soft/70"
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

        <ol className="mt-10 space-y-8 border-l border-border-soft/70 pl-6">
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
              <p className="text-sm font-medium text-primary">{entry.org}</p>
              <p className="mt-2 text-sm leading-relaxed text-text/90">{entry.body}</p>
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
