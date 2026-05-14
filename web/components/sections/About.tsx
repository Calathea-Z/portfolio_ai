import { sectionIds } from "@/lib/site-config";

export function About() {
  return (
    <section
      id={sectionIds.about}
      aria-labelledby="about-heading"
      className="scroll-mt-24 border-t border-border-subtle bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          About
        </p>
        <h2
          id="about-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          How I work
        </h2>
        <div className="mt-6 grid gap-6 text-base leading-relaxed text-secondary md:grid-cols-2">
        <p>
          I&apos;m a full-stack engineer focused on React, TypeScript, and .NET. I&apos;m comfortable stretching into other
          languages and backend styles when a codebase calls for it. I ship 0-to-1 features and reusable component libraries, own REST
          APIs and service boundaries, and treat observability as part of delivery (Azure, Grafana, Application Insights,
          GitHub Actions, Azure Pipelines).
        </p>
        <p>
          I collaborate tightly with product and design in fast-moving environments, invest in code review and mentoring,
          and use AI-augmented workflows (Copilot, Claude) where they measurably speed delivery. Remote-first is my
          default; open to hybrid for the right team and opportunity.
        </p>
        </div>
      </div>
    </section>
  );
}
