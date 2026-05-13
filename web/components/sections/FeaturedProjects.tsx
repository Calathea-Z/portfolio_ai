import Link from "next/link";
import { projects, type Project, type ProjectStatus } from "@/lib/projects";
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

function chunkPairs<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <li
      className={`group min-h-0 min-w-0 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm transition-all focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-surface hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md sm:grid sm:grid-rows-subgrid sm:row-span-3 sm:gap-0`}
    >
      <Link href={project.href} className="contents">
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

        <p className="text-sm leading-relaxed text-secondary">{project.blurb}</p>

        <p className="mt-5 text-sm leading-relaxed text-secondary sm:mt-6">
          <span className="font-medium text-primary">At a glance:</span> {project.capability}
        </p>
      </Link>
    </li>
  );
}

export function FeaturedProjects() {
  const rows = chunkPairs(projects, 2);

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
          Short write-ups with a live demo where it makes sense, plus links into the repo.
        </p>

        <div className="mt-10 flex flex-col gap-10">
          {rows.map((pair) => (
            <ul
              key={pair.map((p) => p.slug).join("-")}
              className={`m-0 flex list-none flex-col gap-5 p-0 sm:grid sm:grid-cols-2 sm:grid-rows-[auto_auto_1fr] sm:gap-x-5 sm:gap-y-4 ${pair.length === 1 ? "sm:grid-cols-1" : ""}`}
            >
              {pair.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
