import Link from "next/link";
import { projects, type ProjectStatus } from "@/lib/projects";
import { sectionIds } from "@/lib/site-config";

const statusCopy: Record<ProjectStatus, string> = {
  planned: "Planned",
  "in-progress": "In progress",
  shipped: "Shipped",
};

const statusStyle: Record<ProjectStatus, string> = {
  planned: "border-border-soft bg-surface text-muted",
  "in-progress": "border-primary/40 bg-primary/10 text-primary",
  shipped: "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
};

export function FeaturedProjects() {
  return (
    <section
      id={sectionIds.projects}
      aria-labelledby="projects-heading"
      className="scroll-mt-24 border-t border-border-soft/70 bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Featured projects
        </p>
        <h2
          id="projects-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          Where the AI engineering work lives.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Each project page explains the capability claim, links to the running
          demo, and points at the source. Every &ldquo;what this shows&rdquo;
          line is the line that keeps the page a portfolio piece instead of a
          product page.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                href={project.href}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-border-soft/70 bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight text-text transition-colors group-hover:text-primary">
                    {project.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyle[project.status]}`}
                  >
                    {statusCopy[project.status]}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted">
                  {project.blurb}
                </p>

                <p className="mt-auto text-sm leading-relaxed text-text/90">
                  <span className="font-medium text-primary">What this shows:</span>{" "}
                  {project.capability}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
