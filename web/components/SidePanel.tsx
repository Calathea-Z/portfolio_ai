"use client";

import Link from "next/link";
import { useState } from "react";

const github = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com";
const linkedin = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com";
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@zach.dev";

export function SidePanel() {
  const [open, setOpen] = useState(false);

  const panelInner = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          zach.dev
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Zach
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Full-stack developer · AI-native portfolio
        </p>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          GitHub
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          LinkedIn
        </a>
        <a
          href={`mailto:${email}`}
          className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          Email
        </a>
        <Link
          href="/resume"
          className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          Traditional resume
        </Link>
        <a
          href="/resume.pdf"
          download
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        >
          Download PDF
        </a>
      </nav>

      <p className="mt-auto text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
        Ask the chat anything about background, projects, or fit. No canned corporate answers—just
        what&apos;s in the prompt.
      </p>
    </div>
  );

  return (
    <>
      <header className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Zach</span>
        <button
          type="button"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? "Close" : "Info"}
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 ml-auto h-full w-[min(100%,20rem)] border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            {panelInner}
          </aside>
        </div>
      ) : null}

      <aside className="hidden h-full w-[min(100%,18rem)] shrink-0 border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 md:flex md:flex-col">
        {panelInner}
      </aside>
    </>
  );
}
