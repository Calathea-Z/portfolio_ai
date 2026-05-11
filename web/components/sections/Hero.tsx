import { sectionIds, siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section
      id={sectionIds.hero}
      aria-labelledby="hero-heading"
      className="scroll-mt-24"
    >
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-12 md:px-6 md:pt-24 md:pb-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {siteConfig.role} · {siteConfig.location}
        </p>
        <h1
          id="hero-heading"
          className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl md:text-6xl"
        >
          {siteConfig.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {siteConfig.positioning}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text/80">
          Three years building production software full-time, plus a decade of
          operations leadership before that. The featured projects below are
          where the AI engineering side gets shown off — not described.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`#${sectionIds.projects}`}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] transition-all hover:bg-primary-hover hover:shadow-[0_6px_20px_rgb(124_92_255/0.35)] dark:shadow-[0_4px_14px_rgb(184_165_255/0.25)] dark:hover:shadow-[0_6px_20px_rgb(184_165_255/0.35)]"
          >
            See projects
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="rounded-xl border border-border-soft bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-primary/60 hover:bg-surface-alt"
          >
            Email me
          </a>
          <a
            href={`#${sectionIds.chat}`}
            className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            Or chat with my AI agent ↓
          </a>
        </div>
      </div>
    </section>
  );
}
