export function ChatEmptyHero() {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border-soft/80 bg-surface-alt/80 p-4 duration-300">
      <h3 className="text-xl font-semibold tracking-tight text-text">
        Hi, I&apos;m Zach - full-stack engineer shipping React/.NET on Azure.
      </h3>
      <p className="mt-2 text-sm text-muted">
        Grounded in Zach&apos;s resume and project context. I build production full-stack systems with clear ownership
        from UI to cloud.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="/resume"
          className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] transition-all hover:bg-primary-hover"
        >
          View Resume
        </a>
        <a
          href="mailto:hello@zach.dev"
          className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm font-medium text-text transition-all hover:border-primary/60 hover:bg-surface-alt"
        >
          Email Zach
        </a>
        <a
          href="https://www.linkedin.com/in/zach-sykes/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm font-medium text-text transition-all hover:border-primary/60 hover:bg-surface-alt"
        >
          LinkedIn
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-xs text-muted">
          3+ years professional engineering
        </span>
        <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-xs text-muted">
          Next.js + .NET 8 + Azure
        </span>
        <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-xs text-muted">
          Remote-first collaborator
        </span>
      </div>
    </section>
  );
}
