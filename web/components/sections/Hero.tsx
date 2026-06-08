import { sectionIds, siteConfig } from "@/lib/site-config";

const stackTags = ["React", "TypeScript", ".NET", "Production systems"];

export function Hero() {
  return (
    <section
      id={sectionIds.hero}
      aria-labelledby="hero-heading"
      className="scroll-mt-24"
    >
      <div className="mx-auto max-w-5xl px-4 pt-8 pb-10 md:px-6 md:pt-24 md:pb-20">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary sm:text-xs">
          {siteConfig.role} · {siteConfig.city}
        </p>
        <h1
          id="hero-heading"
          className="mt-2 text-3xl font-semibold tracking-tight text-text sm:mt-3 sm:text-5xl md:text-6xl"
        >
          {siteConfig.name}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-secondary md:hidden">
          {siteConfig.heroMobileLead}
        </p>
        <p className="mt-6 hidden max-w-2xl text-lg leading-relaxed text-secondary sm:text-xl md:block">
          {siteConfig.positioning}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2 md:hidden" aria-label="Core stack">
          {stackTags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border-soft bg-surface px-2.5 py-1 text-[11px] font-medium text-secondary"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <a
            href={`#${sectionIds.projects}`}
            className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-contrast shadow-[var(--shadow-btn)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-btn-hover)] sm:px-5"
          >
            See projects
          </a>
          <a
            href={siteConfig.resume.href}
            download
            className="rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-center text-sm font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-alt sm:px-5"
          >
            Resume
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="col-span-2 rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-center text-sm font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-alt sm:col-span-1 sm:px-5"
          >
            Email me
          </a>
          <a
            href={`#${sectionIds.chat}`}
            className="hidden text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline sm:inline"
          >
            Try the assistant below
          </a>
        </div>
      </div>
    </section>
  );
}
