"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/lib/site-config";

type SidePanelProps = {
  /**
   * When true (default), render the mobile top-bar with an "Info" button that
   * opens a slide-over containing the same identity card. Homepage suppresses
   * this since <StickyNav /> already provides top chrome there.
   */
  mobileMenu?: boolean;
};

/**
 * Compact identity snapshot. On desktop renders as a fixed top-right card
 * (name, role, "Open to remote" pill, contact links). On mobile (when
 * mobileMenu={true}) renders a header bar + slide-over panel.
 */
export function SidePanel({ mobileMenu = true }: SidePanelProps = {}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {mobileMenu ? (
        <header className="flex shrink-0 items-center justify-between border-b border-border-soft bg-surface/80 px-4 py-3 backdrop-blur-md transition-colors duration-300 2xl:hidden">
          <span className="text-sm font-semibold text-text">{siteConfig.name}</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-sm text-text transition-colors hover:bg-surface-alt"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="sidepanel-mobile"
            >
              {open ? "Close" : "Info"}
            </button>
          </div>
        </header>
      ) : null}

      {mobileMenu && open ? (
        <div className="fixed inset-0 z-40 flex 2xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id="sidepanel-mobile"
            className="relative z-50 ml-auto h-full w-[min(100%,20rem)] border-l border-border-soft bg-surface shadow-xl"
          >
            <SnapshotCard onCloseMobile={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <aside
        aria-label="At a glance"
        className="pointer-events-none fixed top-24 right-6 z-20 hidden w-60 max-w-[calc(100vw-2rem)] 2xl:block"
      >
        <div className="pointer-events-auto">
          <SnapshotCard />
        </div>
      </aside>
    </>
  );
}

type SnapshotCardProps = {
  onCloseMobile?: () => void;
};

function SnapshotCard({ onCloseMobile }: SnapshotCardProps = {}) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface-raised p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-primary">
          ZS
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-widest text-primary">
            zachsykes.dev
          </p>
          <p className="truncate text-sm font-semibold tracking-tight text-text">
            {siteConfig.name}
          </p>
          <p className="truncate text-xs text-muted">{siteConfig.location}</p>
        </div>
      </div>

      <div className="mt-3 inline-flex rounded-full border border-border-soft bg-surface-alt px-3 py-1 text-xs font-medium text-text">
        Open to remote roles
      </div>

      <nav className="mt-4 flex flex-col gap-1 text-sm" aria-label="Contact">
        <a
          href={siteConfig.github}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-2 py-1 text-text transition-colors hover:bg-surface-alt hover:text-primary"
        >
          GitHub
        </a>
        <a
          href={siteConfig.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-2 py-1 text-text transition-colors hover:bg-surface-alt hover:text-primary"
        >
          LinkedIn
        </a>
        <a
          href={`mailto:${siteConfig.email}`}
          className="rounded-lg px-2 py-1 text-text transition-colors hover:bg-surface-alt hover:text-primary"
        >
          Email
        </a>
        <Link
          href="/resume"
          onClick={onCloseMobile}
          className="rounded-lg px-2 py-1 text-text transition-colors hover:bg-surface-alt hover:text-primary"
        >
          Traditional resume
        </Link>
      </nav>

      <a
        href={siteConfig.resume.href}
        download
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border-soft bg-surface-alt px-3 py-2 text-xs font-medium text-text shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
      >
        ↓ Download resume ({siteConfig.resume.label})
      </a>
    </div>
  );
}
