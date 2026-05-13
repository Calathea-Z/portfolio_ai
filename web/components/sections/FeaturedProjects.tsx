import Link from "next/link";
import { projects, type ProjectStatus } from "@/lib/projects";
import { sectionIds } from "@/lib/site-config";

const statusCopy: Record<ProjectStatus, string> = {
  planned: "Coming Soon!",
  "in-progress": "In progress",
  shipped: "Shipped",
};

const statusStyle: Record<ProjectStatus, string> = {
  planned: "border-border-subtle bg-surface text-muted",
  "in-progress": "border-info-border bg-info-bg text-info-fg",
  shipped: "border-success-border bg-success-bg text-success-fg",
};

export function FeaturedProjects() {
  return (
    <section
      id={sectionIds.projects}
      aria-labelledby="projects-heading"
      className="scroll-mt-24 border-t border-border-subtle bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Featured projects
        </p>
        <h2
          id="projects-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          Selected projects
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-secondary">
          Short write-ups with a live demo where it makes sense, plus links into the repo. A few
          focus on how I integrate LLMs; the rest of my work is the usual full-stack delivery
          you&apos;d expect from the roles on my resume.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                href={project.href}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md"
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

                <p className="text-sm leading-relaxed text-secondary">
                  {project.blurb}
                </p>

                <p className="mt-auto text-sm leading-relaxed text-secondary">
                  <span className="font-medium text-primary">At a glance:</span>{" "}
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
