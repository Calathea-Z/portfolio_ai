import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Resume · Zach Sykes",
  description: "Traditional résumé view aligned with the downloadable PDF.",
};

const forvisBullets = [
  "Lead end-to-end delivery of production web features using React, TypeScript, Next.js, ASP.NET Core, and cloud services — spanning UI architecture, API integration, deployment, monitoring, and ongoing production support.",
  "Design and build scalable front-end applications that simplify complex business workflows, integrate with backend services and databases, and improve day-to-day user productivity.",
  "Established reusable React/TypeScript component patterns, shared front-end conventions, and API integration standards adopted across multiple engineering teams to improve consistency, maintainability, and developer velocity.",
  "Architected and built a real-time collaborative Planning Poker platform from the ground up using React, ASP.NET Core, WebSockets, and Jira integration — adopted across engineering teams as a reusable internal product.",
  "Own production quality for user-facing applications through monitoring, debugging, incident response, root-cause analysis, and continuous performance and stability improvements.",
  "Partner closely with product managers, designers, business stakeholders, and backend engineers to translate requirements into polished, maintainable, and scalable technical solutions.",
];

const selectedProjects = [
  {
    title: "zachsykes.dev Portfolio Assistant",
    stack: "Anthropic API · Next.js · ASP.NET Core · C#",
    body: "Built an AI-powered portfolio assistant using Anthropic tool calling, Next.js, ASP.NET Core, and streaming API responses — including a polished recruiter-facing chat UI deployed with Vercel.",
  },
  {
    title: "Portfolio MCP Resume Server",
    stack: "Model Context Protocol · Node.js · TypeScript · .NET",
    body: "Built a Model Context Protocol server with Node.js and TypeScript exposing structured resume tools to Claude Desktop and other AI clients, enabling reusable AI integrations without custom HTTP APIs.",
  },
  {
    title: "Distributed Sports Odds Platform",
    stack: ".NET · Kafka · Docker · WebSockets · Redis",
    body: "Built and load-tested a distributed real-time sports platform using .NET, React, RabbitMQ, Docker, WebSockets, Redis, and containerized services to model scalable event-driven UI updates and system architecture patterns.",
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
                download
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
            <h1 className="text-3xl font-semibold tracking-tight text-text">
              Zach Sykes
            </h1>
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
              Full-stack engineer with a strong senior-level front-end focus, building production web
              applications with TypeScript, React, Next.js, ASP.NET Core, cloud services, and modern
              API integrations. Experienced owning user-facing features from architecture through
              deployment, observability, performance improvement, and long-term maintenance.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Core competencies
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-secondary">
              <p>
                <span className="font-medium text-text">Frontend engineering: </span>
                TypeScript, React, Next.js, JavaScript, Tailwind CSS, component architecture,
                responsive UI, accessibility, state management, front-end performance
              </p>
              <p>
                <span className="font-medium text-text">Web application architecture: </span>
                API integration, server-side rendering, scalable web applications, distributed
                application design, end-to-end feature ownership
              </p>
              <p>
                <span className="font-medium text-text">Backend &amp; systems integration: </span>
                C#, .NET, ASP.NET Core, REST APIs, Entity Framework Core, asynchronous programming,
                PostgreSQL, SQL Server
              </p>
              <p>
                <span className="font-medium text-text">Cloud, reliability &amp; delivery: </span>
                Vercel, Azure App Services, Azure Functions, Azure Storage, Service Bus, Docker,
                GitHub Actions, Azure Pipelines, monitoring, observability, production support
              </p>
              <p>
                <span className="font-medium text-text">Collaboration &amp; leadership: </span>
                Cross-functional product delivery, stakeholder communication, mentoring, technical
                standards, remote team collaboration
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Professional experience
            </h2>
            <div className="mt-4 space-y-10 text-sm text-secondary">
              <div>
                <p className="font-medium text-text">
                  Full Stack Software Engineer{" "}
                  <span className="text-muted">|</span> Forvis Mazars (Remote)
                </p>
                <p className="text-xs font-medium uppercase tracking-widest text-muted">
                  06/2023 – Present
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
                  {forvisBullets.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
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
                  <p className="mt-2 leading-relaxed">{project.body}</p>
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
