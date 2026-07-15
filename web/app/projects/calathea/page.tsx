import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

const project = getProject("calathea")!;

export const metadata: Metadata = {
  title: `${project.title} · ${siteConfig.name}`,
  description: project.blurb,
};

const techTags = ["Next.js", "TypeScript", "React", "Vercel", "WordPress", "Custom CMS"];

export default function CalatheaProjectPage() {
  return (
    <div className="relative min-h-screen w-full text-text">
      <BackgroundOrbs />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
            <Link
              href="/"
              className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              ← Back to portfolio
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <section aria-labelledby="project-heading">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Featured project
            </p>
            <h1
              id="project-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl"
            >
              {project.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-secondary">
              <span className="font-medium text-primary">At a glance:</span>{" "}
              {project.capability}
            </p>
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-secondary">
              {project.blurb}
            </p>
            <p className="mt-4">
              <a
                href="https://www.calathea.design/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-contrast shadow-[var(--shadow-btn)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-btn-hover)]"
              >
                Visit calathea.design →
              </a>
            </p>
          </section>

          <section
            aria-labelledby="problem"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="problem"
              className="text-xl font-semibold tracking-tight text-text"
            >
              What it is
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Under Calathea Web Design I ship marketing and e-commerce sites for small-business
              clients end-to-end: discovery, responsive UI, content workflows, integrations, and
              production hosting. Engagements range from storefronts and promotional sites to
              nonprofit WordPress builds and custom CMS tooling when editorial workflows need more
              than a template.
            </p>
          </section>

          <section
            aria-labelledby="workflows"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="workflows"
              className="text-xl font-semibold tracking-tight text-text"
            >
              Workflows, not just pages
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              The work is product-shaped: order and catalog flows on commerce sites, administrative
              and publishing flows for CMS clients, and forms that connect to APIs or third-party
              services. The UI has to stay understandable for non-technical owners while remaining
              maintainable for long-term iteration.
            </p>
          </section>

          <section
            aria-labelledby="tech-stack"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="tech-stack"
              className="text-xl font-semibold tracking-tight text-text"
            >
              Tech stack
            </h2>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono">
              {techTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border-subtle bg-surface-alt px-2 py-0.5 text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="ownership"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="ownership"
              className="text-xl font-semibold tracking-tight text-text"
            >
              What I owned
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-secondary">
              <li>
                End-to-end delivery: UI/UX, frontend implementation, backend integrations, and
                Vercel deployment.
              </li>
              <li>
                Custom CMS creation when clients needed tailored editorial workflows instead of
                off-the-shelf templates.
              </li>
              <li>
                Direct client communication from requirements through launch and post-launch
                iteration — five client sites shipped end-to-end.
              </li>
              <li>
                Built and launched{" "}
                <a
                  href="https://www.calathea.design/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  calathea.design
                </a>{" "}
                itself as a production Next.js application at the same quality bar as client work.
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="why"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="why" className="text-xl font-semibold tracking-tight text-text">
              Why it belongs on this portfolio
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Planning Poker shows internal product ownership with realtime state and backend
              integration. Calathea is the publicly shareable companion: commerce and CMS workflows,
              responsive React/Next.js UI, API integration, and production ownership you can click
              through today.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
