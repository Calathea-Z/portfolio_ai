import { sectionIds } from "@/lib/site-config";

export function About() {
  return (
    <section
      id={sectionIds.about}
      aria-labelledby="about-heading"
      className="scroll-mt-24 border-t border-border-subtle bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-20">
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
            I own delivery across the stack — API contracts, service boundaries, deployment pipelines, and production
            health. Observability is part of shipping, not an afterthought: Grafana, Application Insights, GitHub Actions,
            and Azure Pipelines are how I keep releases safe and incidents diagnosable.
          </p>
          <p>
            I collaborate directly with product, design, and business stakeholders to turn requirements into shipped
            features, invest in code review and mentoring, and use AI-augmented workflows (Copilot, Claude) where they
            measurably speed delivery. Based in Denver and open to hybrid roles for the right engineering team;
            experienced working effectively in remote environments.
          </p>
        </div>
      </div>
    </section>
  );
}
