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
            I build and own production applications across frontend architecture, backend APIs, cloud
            infrastructure, and observability, with a particular focus on making complex workflows
            intuitive for users. The goal is not a longer tech list — it is turning operational
            complexity into understandable, maintainable experiences.
          </p>
          <p>
            I partner directly with product, design, and business stakeholders to ship features that
            stick: clear contracts, reusable patterns, and production health (Grafana, Application
            Insights, GitHub Actions, Azure Pipelines). Based in Denver and open to hybrid roles for
            the right team; experienced working effectively remote.
          </p>
        </div>
      </div>
    </section>
  );
}
