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
  "Lead end-to-end feature delivery using React, TypeScript, Next.js, and .NET — from UI design through backend API implementation, cloud deployment, and production monitoring, with full ownership.",
  "Built a real-time collaborative platform (Planning Poker) as a reusable tool on top of internal infrastructure — independently architected and shipped from 0 to 1, including WebSocket infrastructure and backend services.",
  "Designed and established React/TypeScript component systems and API integration patterns adopted across multiple teams — improved consistency and developer velocity.",
  "Built and maintained CI/CD pipelines (GitHub Actions, Azure Pipelines) and production observability tooling (Grafana, Application Insights) — enabling safe, rapid releases and active incident response.",
  "Collaborated directly with product, design, and business stakeholders to translate requirements into shipped features — skilled at communicating technical tradeoffs and architectural decisions across disciplines.",
  "Mentored junior engineers on code quality, architecture patterns, and best practices — actively invested in raising team-wide technical standards.",
  "Integrate AI coding tools (GitHub Copilot, Claude) into daily engineering workflows — measurably improving delivery speed and enabling deeper focus on architecture and problem-solving.",
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
              ← Back to chat
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
                <span>{siteConfig.location}</span>
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
              {siteConfig.positioning}
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Core competencies
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-secondary">
              <p>
                <span className="font-medium text-text">Frontend: </span>
                React, Next.js, TypeScript, JavaScript, Tailwind CSS, Blazor —
                component architecture, performance-minded rendering, polished
                and accessible UX
              </p>
              <p>
                <span className="font-medium text-text">
                  Backend &amp; APIs:{" "}
                </span>
                C#/.NET, ASP.NET Core, REST API design, EF Core — service
                ownership; familiar with Python, Node.js/TypeScript paradigms
              </p>
              <p>
                <span className="font-medium text-text">
                  Data &amp; systems:{" "}
                </span>
                PostgreSQL, SQL Server — schema design, API-layer contracts,
                scalable data models
              </p>
              <p>
                <span className="font-medium text-text">
                  Cloud &amp; DevOps:{" "}
                </span>
                Azure (App Services, Functions, Service Bus, Storage), Vercel,
                GitHub Actions, Azure Pipelines, Grafana, Azure Application
                Insights
              </p>
              <p>
                <span className="font-medium text-text">
                  Engineering standards:{" "}
                </span>
                Code reviews, mentoring, automated testing (xUnit, Moq,
                integration tests), Git/GitHub, Docker familiarity, AI-augmented
                workflows (GitHub Copilot, Claude)
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
              Professional experience
            </h2>
            <div className="mt-4 space-y-3 text-sm text-secondary">
              <div>
                <p className="font-medium text-text">
                  Full Stack Software Engineer{" "}
                  <span className="text-muted">|</span> Forvis Mazars (Remote)
                </p>
                <p className="text-xs font-medium uppercase tracking-widest text-muted">
                  06/2023 – Present
                </p>
                <p className="mt-2 leading-relaxed">
                  Build and maintain production web applications and APIs
                  serving enterprise users — owning architecture, delivery,
                  reliability, and operational health across the full stack.
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
              Prior experience
            </h2>
            <div className="mt-4 text-sm text-secondary">
              <p className="font-medium text-text">
                Kitchen Manager <span className="text-muted">|</span> Asheville
                Pizza and Brewing Company
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                2012 – 2022
              </p>
              <p className="mt-2 leading-relaxed">
                Progressed from line cook to Kitchen Manager. Led daily
                operations, team management, and process improvement in a
                high-volume environment.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
                <li>
                  Led and managed a 40+ person team — hiring, onboarding,
                  training, scheduling, performance management, and culture
                  building.
                </li>
              </ul>
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
