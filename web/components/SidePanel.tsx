"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const github = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com";
const linkedin = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com";
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@zach.dev";

export function SidePanel() {
  const [open, setOpen] = useState(false);

  const panelInner = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          zach.dev
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text">
          Zach Sykes
        </h1>
        <p className="mt-1 text-sm text-muted">
          Full-stack developer · Denver (remote-first)
        </p>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          GitHub
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          LinkedIn
        </a>
        <a
          href={`mailto:${email}`}
          className="text-text underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Email
        </a>
        <Link
          href="/resume"
          className="text-text underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Traditional resume
        </Link>
        <a
          href="/Sykes_Zach_Resume_2026_Default.docx"
          download
          className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-border-soft bg-surface-alt px-3 py-2 text-xs font-medium text-text shadow-sm transition-all hover:border-primary/60 hover:shadow-md"
        >
          Download resume
        </a>
      </nav>

      <p className="mt-auto text-xs leading-relaxed text-muted">
        Chat answers come from resume-backed prompt data—it&apos;s not Zach typing live. Recruiters and hiring
        managers: please reach out by email or LinkedIn when you want a real conversation.
      </p>
    </div>
  );

  return (
    <>
      <header className="flex items-center justify-between border-b border-border-soft bg-surface/80 px-4 py-3 backdrop-blur-md transition-colors duration-300 md:hidden">
        <span className="text-sm font-semibold text-text">Zach Sykes</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-sm text-text transition-colors hover:bg-surface-alt"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "Close" : "Info"}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 ml-auto h-full w-[min(100%,20rem)] border-l border-border-soft bg-surface shadow-xl">
            {panelInner}
          </aside>
        </div>
      ) : null}

      <aside className="hidden h-full w-[min(100%,18rem)] shrink-0 border-r border-border-soft bg-linear-to-b from-surface to-surface-alt transition-colors duration-300 md:flex md:flex-col">
        {panelInner}
      </aside>
    </>
  );
}
