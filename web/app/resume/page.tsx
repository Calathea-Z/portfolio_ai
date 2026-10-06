import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Resume · Zach Sykes",
  description: "Traditional résumé view aligned with the downloadable PDF.",
};

const competencies = [
  {
    label: "Production engineering",
    detail: "Root-cause debugging, incident response, observability, monitoring, automated testing",
  },
  {
    label: "AI and agent tooling",
    detail: "Cursor, Codex, GitHub Copilot, Anthropic API, structured tool calling, MCP",
  },
  {
    label: "Backend and data",
    detail: "C#/.NET, ASP.NET Core, REST APIs, EF Core, PostgreSQL, SQL Server; Node.js (projects)",
  },
  {
    label: "Frontend",
    detail: "React, TypeScript, JavaScript, Tailwind CSS, accessible UX, Next.js (projects)",
  },
  {
    label: "Systems and delivery",
    detail: "Azure Functions, Service Bus, WebSockets, SignalR, Docker, GitHub Actions, Azure Pipelines",
  },
  {
    label: "Observability",
    detail: "Grafana, Application Insights; traceability and reliability across asynchronous workflows",
  },
];

const forvisBullets = [
  "Own production quality and reliability for critical applications, including incident response, root-cause debugging, monitoring, error reduction, and long-term stability improvements across distributed workflows.",
  "Lead end-to-end delivery of React, TypeScript, and .NET applications, owning requirements and architecture through implementation, deployment, and production support.",
  "Build event-driven integrations across business systems, REST APIs, Azure services, messaging infrastructure, and relational data stores, emphasizing traceability and resilient asynchronous processing.",
  "Drove the transition from Blazor frontends to React and TypeScript, establishing reusable component and API integration patterns adopted across multiple teams and improving maintainability and delivery consistency.",
  "Support CI/CD and production observability with GitHub Actions, Azure Pipelines, Grafana, and Application Insights to enable rapid releases and effective production troubleshooting.",
  "Independently architected and shipped a real-time Planning Poker platform with WebSocket/SignalR infrastructure and backend services; adopted across software teams as a reusable internal tool.",
  "Mentor junior engineers on architecture, code quality, debugging, and engineering practices; contribute to team-wide technical standards.",
];

const selectedProjects = [
  {
    title: "Agentic Portfolio Assistant & MCP Server",
    stack: "Next.js · ASP.NET Core · Anthropic API · Node.js · MCP",
    bullets: [
      "Built an agentic assistant with a Next.js interface and ASP.NET Core streaming backend using Anthropic’s Messages API and seven structured resume tools; added deterministic chat evals that exercise the live streaming endpoint and score tool-call and output criteria.",
      "Built a Node.js/TypeScript stdio MCP server exposing the same seven structured resume tools to Claude Desktop and other MCP clients; added schema-parity tests to keep MCP contracts aligned with the .NET API.",
    ],
  },
];

export default function ResumePage() {
  return (
    <div className="relative min-h-full text-text">
      <BackgroundOrbs />
      <div className="relative z-10">
        <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/80 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              ← Back to portfolio
            </Link>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.resume.href}
                download={siteConfig.resume.fileName}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast shadow-[var(--shadow-btn)] transition-all hover:bg-primary-hover hover:shadow-[var(--shadow-btn-hover)]"
              >
                Download resume (.pdf)
              </a>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
          <section>
            <h1 className="text-3xl font-semibold tracking-tight text-text">Zach Sykes</h1>
            <address className="mt-3 not-italic">
              <p className="flex flex-wrap gap-x-2 gap-y-1 text-sm leading-relaxed text-secondary">
                <span>{siteConfig.city}</span>
                <span className="text-muted" aria-hidden>
                  ·
                </span>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {siteConfig.email}
                </a>
                <span className="text-muted" aria-hidden>
                  ·
                </span>
                <a
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  linkedin.com/in/zach-sykes
                </a>
                <span className="text-muted" aria-hidden>
                  ·
                </span>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  github.com/Calathea-Z
                </a>
              </p>
            </address>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Professional summary
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-secondary">
              Senior software engineer with 3+ years building and supporting production applications
              across React, TypeScript, C#/.NET, APIs, and relational databases. Own production
              reliability, incident response, and root-cause debugging alongside end-to-end delivery.
              Build agentic applications and Model Context Protocol (MCP) integrations, with hands-on
              experience using Cursor, Codex, and GitHub Copilot.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Core competencies
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-secondary">
              {competencies.map((item) => (
                <p key={item.label}>
                  <span className="font-medium text-text">{item.label}: </span>
                  {item.detail}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Professional experience
            </h2>
            <div className="mt-4 text-sm text-secondary">
              <p className="font-medium text-text">
                Senior Software Engineer <span className="text-muted">|</span> Forvis Mazars · Remote
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                09/2026 – Present
              </p>
              <p className="mt-1 text-sm text-secondary">
                Promoted from Full Stack Software Engineer, 06/2023 – 09/2026
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
                {forvisBullets.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Selected projects
            </h2>
            <div className="mt-4 space-y-6 text-sm text-secondary">
              {selectedProjects.map((project) => (
                <div key={project.title}>
                  <p className="font-medium text-text">{project.title}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted">
                    {project.stack}
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
                    {project.bullets.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Education
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-secondary">
              Software Engineering Bootcamp — General Assembly
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
