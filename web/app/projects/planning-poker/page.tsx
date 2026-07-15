import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

const project = getProject("planning-poker")!;

export const metadata: Metadata = {
  title: `${project.title} · ${siteConfig.name}`,
  description: project.blurb,
};

const techTags = ["React", "TypeScript", ".NET", "WebSocket", "Jira API", "Azure"];

export default function PlanningPokerProjectPage() {
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
            <p className="mt-4 inline-flex rounded-full border border-border-soft bg-surface-alt px-3 py-1 text-xs font-medium text-muted">
              Internal tool — no public demo or repo
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-secondary">
              This is an internal production application owned by my employer. Source code,
              screenshots, and a public demonstration cannot be shared.
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
              Problem
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Distributed delivery teams at Forvis Mazars were coordinating estimation sessions
              manually — scattered links, inconsistent session state, and friction that slowed
              planning meetings. Stories already lived in Jira, but estimation sessions had no
              shared workflow for viewing those stories, running planning poker in real time, and
              writing estimates back.
            </p>
          </section>

          <section
            aria-labelledby="users"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="users"
              className="text-xl font-semibold tracking-tight text-text"
            >
              Users
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Software delivery teams across all Forvis Mazars verticals — scrum masters,
              engineers, and product partners running distributed estimation sessions. After launch,
              every software team adopted the tool as the standard for real-time planning poker.
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
            aria-labelledby="jira"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="jira"
              className="text-xl font-semibold tracking-tight text-text"
            >
              Jira integration
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              The tool integrates directly with Jira so teams can pull stories into an estimation
              session, review context in one place, and push updated information — including
              estimates — back to Jira when a round completes. That kept planning poker inside the
              workflow teams already used instead of copying story details between tools.
            </p>
          </section>

          <section
            aria-labelledby="architecture"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="architecture"
              className="text-xl font-semibold tracking-tight text-text"
            >
              Architecture
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              React/TypeScript clients connect to a .NET backend over WebSockets for live session
              state. REST endpoints handle session setup, Jira story fetch/update, and persistence;
              the WebSocket hub broadcasts vote reveals, participant joins, and round transitions
              to every connected client in a room.
            </p>

            <div
              className="mt-6 overflow-x-auto rounded-xl border border-border-soft bg-surface-alt p-4"
              aria-label="Architecture diagram"
            >
              <div className="flex min-w-[28rem] flex-col items-center gap-3 text-center text-xs font-medium text-secondary">
                <div className="w-full max-w-xs rounded-lg border border-primary/30 bg-surface px-4 py-3">
                  React clients
                  <span className="mt-1 block font-normal text-muted">TypeScript UI</span>
                </div>
                <span className="text-muted" aria-hidden="true">
                  ↕ WebSocket + REST
                </span>
                <div className="w-full max-w-xs rounded-lg border border-primary/30 bg-surface px-4 py-3">
                  .NET API + WebSocket hub
                  <span className="mt-1 block font-normal text-muted">
                    Session orchestration
                  </span>
                </div>
                <span className="text-muted" aria-hidden="true">
                  ↕
                </span>
                <div className="flex w-full max-w-lg gap-3">
                  <div className="flex-1 rounded-lg border border-border-soft bg-surface px-3 py-2">
                    Session state
                  </div>
                  <div className="flex-1 rounded-lg border border-border-soft bg-surface px-3 py-2">
                    Jira API
                  </div>
                  <div className="flex-1 rounded-lg border border-border-soft bg-surface px-3 py-2">
                    Azure hosting
                  </div>
                </div>
              </div>
            </div>

            <pre className="mt-4 overflow-x-auto rounded-xl border border-border-soft bg-code-bg p-4 text-left text-[11px] leading-relaxed text-code-fg">
              {`flowchart TB
  clients[React clients] -->|"WebSocket + REST"| api[".NET API + WebSocket hub"]
  api --> state[Session state]
  api --> jira[Jira API]
  api --> azure[Azure hosting]`}
            </pre>
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
                Solo 0-to-1 delivery: frontend, backend services, WebSocket infrastructure, and
                Azure deployment.
              </li>
              <li>
                Session and room model — creating rooms, joining participants, and managing round
                lifecycle.
              </li>
              <li>
                Jira integration — loading stories into sessions and writing estimates and updates
                back to Jira after rounds complete.
              </li>
              <li>
                Integration with existing internal infrastructure so other teams could adopt the
                tool without bespoke setup per vertical.
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="realtime"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="realtime"
              className="text-xl font-semibold tracking-tight text-text"
            >
              WebSocket / realtime design
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Each estimation session maps to a room with a persistent connection per participant.
              Vote submissions stay local until a facilitator reveals — at which point the hub
              broadcasts the round result to every client simultaneously. Connection lifecycle
              handling covers reconnects and late joiners so distributed teams stay in sync without
              manual refresh.
            </p>
          </section>

          <section
            aria-labelledby="adoption"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="adoption"
              className="text-xl font-semibold tracking-tight text-text"
            >
              Adoption
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              After launch, Planning Poker was adopted by every software team across all verticals
              — replacing the manual coordination workflow that preceded it. The tool became the
              default for distributed estimation sessions company-wide.
            </p>
          </section>

          <section
            aria-labelledby="learnings"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2
              id="learnings"
              className="text-xl font-semibold tracking-tight text-text"
            >
              What I learned
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Internal tooling rewards the same discipline as customer-facing products: clear
              contracts, observable deployments, and rollout planning across teams. Realtime
              sessions surface edge cases fast — reconnect handling and consistent state across
              participants mattered more than UI polish. Shipping something small that every team
              actually used beat a larger feature set nobody adopted.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
