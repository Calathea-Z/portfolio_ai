import Link from "next/link";
import { projectsByStatus } from "@/lib/projects";
import { sectionIds } from "@/lib/site-config";

export function CurrentWork() {
  const current = projectsByStatus("in-progress");
  if (current.length === 0) return null;

  return (
    <section
      id={sectionIds.now}
      aria-labelledby="now-heading"
      className="scroll-mt-24 border-t border-border-subtle bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Now</p>
        <h2
          id="now-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          Currently working on
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-secondary">
          The personal project I am spending my time on. Shipped work is in the section below.
        </p>

        <ul className="mt-8 flex list-none flex-col gap-5 p-0">
          {current.map((project) => (
            <li
              key={project.slug}
              className="rounded-2xl border border-info-border bg-surface p-6 shadow-sm md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-xl font-semibold tracking-tight text-text">{project.title}</h3>
                <span className="shrink-0 rounded-full border border-info-border bg-info-bg px-2 py-0.5 text-[11px] font-medium text-info-fg">
                  Personal · in progress
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-secondary">{project.blurb}</p>
              {project.highlights ? (
                <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-secondary">
                  {project.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-5 text-sm leading-relaxed text-secondary">
                <span className="font-medium text-primary">At a glance:</span> {project.capability}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href={project.href}
                  className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-contrast shadow-[var(--shadow-btn)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-btn-hover)]"
                >
                  Read the write-up
                </Link>
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View on GitHub
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
