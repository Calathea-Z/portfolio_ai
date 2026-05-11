import { sectionIds, siteConfig } from "@/lib/site-config";

type ContactLink = {
  label: string;
  detail: string;
  href: string;
  external?: boolean;
};

const links: ContactLink[] = [
  {
    label: "Email",
    detail: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    label: "GitHub",
    detail: "github.com/Calathea-Z",
    href: siteConfig.github,
    external: true,
  },
  {
    label: "LinkedIn",
    detail: "linkedin.com/in/zach-sykes",
    href: siteConfig.linkedin,
    external: true,
  },
];

export function Contact() {
  return (
    <section
      id={sectionIds.contact}
      aria-labelledby="contact-heading"
      className="scroll-mt-24 border-t border-border-soft/70 bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Contact
        </p>
        <h2
          id="contact-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          Email is the fastest way to reach me.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          For recruiting, interviewing, or any conversation that needs actual
          back-and-forth, please email or LinkedIn. The chat assistant is for
          quick context, not for replies from me.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(({ label, detail, href, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex h-full flex-col gap-1 rounded-2xl border border-border-soft/70 bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {label}
                </span>
                <span className="text-base font-medium text-text">{detail}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={siteConfig.resume.href}
            download
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] transition-all hover:bg-primary-hover hover:shadow-[0_6px_20px_rgb(124_92_255/0.35)] dark:shadow-[0_4px_14px_rgb(184_165_255/0.25)] dark:hover:shadow-[0_6px_20px_rgb(184_165_255/0.35)]"
          >
            ↓ Download resume ({siteConfig.resume.label})
          </a>
          {siteConfig.resume.hasDedicatedPdf ? (
            <a
              href={siteConfig.resume.fallbackDocxHref}
              download
              className="rounded-xl border border-border-soft bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-primary/60 hover:bg-surface-alt"
            >
              Download (.docx)
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
