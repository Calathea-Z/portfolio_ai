import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { AgenticChatDemo } from "@/components/AgenticChatDemo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

const project = getProject("agentic-chat")!;

export const metadata: Metadata = {
  title: `${project.title} · ${siteConfig.name}`,
  description: project.blurb,
};

export default function AgenticChatProjectPage() {
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
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Featured project
            </p>
            <span className="rounded-full border border-success-border bg-success-bg px-2 py-0.5 text-[11px] font-medium text-success-fg">
              Shipped
            </span>
          </div>
          <h1
            id="project-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl"
          >
            {project.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-secondary">
            <span className="font-medium text-primary">What this shows:</span>{" "}
            {project.capability}
          </p>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-secondary">{project.blurb}</p>
        </section>

        <section
          aria-labelledby="how-it-works"
          className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
        >
          <h2
            id="how-it-works"
            className="text-xl font-semibold tracking-tight text-text"
          >
            How it works
          </h2>
          <p className="mt-2 text-sm text-secondary">
            The chat backend runs a bounded tool-use loop instead of one-shot prompting. Each
            round is a streamed Anthropic request; the server intercepts{" "}
            <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
              tool_use
            </code>{" "}
            blocks, runs the handler, appends the{" "}
            <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
              tool_result
            </code>
            , and continues until the model stops asking for
            tools or we hit the round cap.
          </p>

          <p className="mt-4 text-sm text-secondary">
            Optional{" "}
            <span className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
              Reflection:PlannerEnabled
            </span>{" "}
            in API
            config appends a short planning instruction to the system prompt (second, uncached block when
            prompt caching is on) so the model states which tools it intends to use before the first tool
            call. Enable for demos; defaults off in production configs.
          </p>

          <p className="mt-2 text-sm text-secondary">
            Estimated token usage and cost for the demo update live under the chat in two summary cards (session total
            + latest reply).
          </p>

          <ol className="mt-6 space-y-3 text-sm text-secondary">
            <Step
              n={1}
              title="Conversation + tools out"
              body="User message and seven tool schemas (get_role, search_resume, list_projects_by_skill, get_metrics, list_recent_shipped, get_narrative, get_faq) ship to the Anthropic Messages API with streaming enabled."
            />
            <Step
              n={2}
              title="Stream events out"
              body="Text deltas are forwarded to the browser as NDJSON. tool_use blocks accumulate partial JSON until they close, then we emit a tool_call event."
            />
            <Step
              n={3}
              title="Run handler against resume data"
              body="ResumeTools resolves the call against the structured Data/resume.json. The result becomes a tool_result event in the same stream."
            />
            <Step
              n={4}
              title="Loop until done"
              body="If the round ends with stop_reason='tool_use', the conversation gets the assistant's tool_use blocks + a user tool_result, and a new round begins. Otherwise the final text answer streams and we emit done."
            />
          </ol>

          <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-mono">
            {[
              ".NET 8",
              "ASP.NET Core",
              "Anthropic Messages API",
              "Server-Sent Events",
              "NDJSON",
              "Next.js 16",
              "React 19",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-subtle bg-surface-alt px-2 py-0.5 text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section aria-labelledby="try-it" className="mt-12">
          <h2
            id="try-it"
            className="text-xl font-semibold tracking-tight text-text"
          >
            Try it
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Start with one of the seeded prompts to see a tool call fire, then ask a follow-up
            of your own. Click any pill to expand the input and the JSON the tool returned.
          </p>

          <div className="mt-6 flex h-[min(88dvh,860px)] min-h-[600px] max-w-full flex-col overflow-x-hidden md:h-[720px] md:min-h-0">
            <AgenticChatDemo />
          </div>
        </section>

        <section aria-labelledby="source" className="mt-12 border-t border-border-subtle pt-8">
          <h2 id="source" className="text-xl font-semibold tracking-tight text-text">
            Source
          </h2>
          <p className="mt-2 text-sm text-muted">The interesting files for this project:</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[13px] text-code-fg">
                api/Portfolio.Api/Services/AnthropicStreamService.cs
              </code>{" "}
              — the streaming tool-use loop.
            </li>
            <li>
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[13px] text-code-fg">
                api/Portfolio.Api/Services/ResumeTools.cs
              </code>{" "}
              — the seven tool handlers.
            </li>
            <li>
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[13px] text-code-fg">
                api/Portfolio.Api/Data/resume.json
              </code>{" "}
              — the structured resume the tools query.
            </li>
            <li>
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[13px] text-code-fg">
                web/components/ToolCallPill.tsx
              </code>{" "}
              — the inline tool-call UI.
            </li>
          </ul>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-xl border border-border-soft bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-alt"
          >
            View on GitHub →
          </a>
        </section>
      </main>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-[11px] font-semibold text-primary">
        {n}
      </span>
      <div>
        <p className="font-medium text-text">{title}</p>
        <p className="mt-1 leading-relaxed text-secondary">{body}</p>
      </div>
    </li>
  );
}
