"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { sectionIds, siteConfig } from "@/lib/site-config";

const links: Array<{ label: string; href: string }> = [
  { label: "About", href: `#${sectionIds.about}` },
  { label: "Chat", href: `#${sectionIds.chat}` },
  { label: "Projects", href: `#${sectionIds.projects}` },
  { label: "Experience", href: `#${sectionIds.experience}` },
  { label: "Contact", href: `#${sectionIds.contact}` },
];

export function StickyNav() {
  const pathname = usePathname();
  const homeTopHref = `/#${sectionIds.hero}`;

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-0 z-30 border-b border-border-subtle bg-surface/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link
          href={homeTopHref}
          className="shrink-0 text-sm font-semibold tracking-tight text-text transition-colors hover:text-primary"
          onClick={(e) => {
            if (pathname !== "/") return;
            e.preventDefault();
            document.getElementById(sectionIds.hero)?.scrollIntoView({ behavior: "smooth", block: "start" });
            window.history.replaceState(null, "", homeTopHref);
          }}
        >
          {siteConfig.name}
        </Link>

        <ul className="hidden min-w-0 flex-1 items-center justify-center gap-1 text-sm md:flex">
          {links.map(({ label, href }) => (
            <li key={href} className="shrink-0">
              <a
                href={href}
                className="rounded-lg px-3 py-1.5 text-muted transition-colors hover:bg-surface-alt hover:text-text"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`mailto:${siteConfig.email}`}
            className="hidden rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-alt sm:inline-flex"
          >
            Email
          </a>
          <a
            href={siteConfig.resume.href}
            download
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-contrast shadow-[var(--shadow-btn)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-btn-hover)]"
          >
            Resume
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
