import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { AgenticChatDemo } from "@/components/AgenticChatDemo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AgenticChatEvalsSection } from "@/components/AgenticChatEvalsSection";
import { loadEvalResults } from "@/lib/eval-results";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

const project = getProject("agentic-chat")!;

export const metadata: Metadata = {
  title: `${project.title} · ${siteConfig.name}`,
  description: project.blurb,
};

export default async function AgenticChatProjectPage() {
  const evalResults = await loadEvalResults();

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
          </div>
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
              body="User message and seven tool schemas (get_role, search_resume, list_projects_by_skill, get_metrics, list_recent_shipped, get_narrative, get_faq) are sent to the Anthropic Messages API with streaming enabled."
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
              ".NET",
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
            Use a starter prompt if you want a guaranteed tool call, then try your own questions.
            Expand a pill to see the arguments and JSON returned.
          </p>

          <div className="mt-6 flex h-[min(88dvh,860px)] min-h-[600px] max-w-full flex-col overflow-x-hidden md:h-[720px] md:min-h-0">
            <AgenticChatDemo />
          </div>
        </section>

        <AgenticChatEvalsSection results={evalResults} />

        <section
          aria-labelledby="design-note"
          className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Design note
          </p>
          <h2
            id="design-note"
            className="mt-2 text-xl font-semibold tracking-tight text-text"
          >
            Why{" "}
            <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[0.85em] text-code-fg">
              search_resume
            </code>{" "}
            is substring matching, not embeddings
          </h2>

          <div className="mt-4 space-y-4 text-sm leading-relaxed text-secondary">
            <p>
              The natural-language search tool on the résumé —{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
                search_resume
              </code>{" "}
              — is a case-insensitive substring match across structured fields.
              No vector store, no embedding API. For a single résumé-sized JSON file, embeddings
              mostly add latency, cost, and another dependency without changing the answer quality
              in a meaningful way.
            </p>
            <p>
              The corpus is one résumé: a handful of roles, a handful of
              projects, a few FAQ entries, and a short career-change narrative.
              The total searchable text is well under 10&nbsp;KB. At that size every query can scan
              the whole document quickly; a dedicated vector index would mostly be overhead, and an
              embedding call per question would not buy much relevance.
            </p>
            <p>
              Query expansion and paraphrasing still happen in the model. The system prompt nudges
              Claude to translate vague questions into concrete search terms when needed—so if a
              recruiter asks{" "}
              <span className="italic">where did Zach work before software</span>, the model can
              search for{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                kitchen
              </code>{" "}
              or{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                restaurant
              </code>
              . The tool itself stays a fast substring pass over structured fields.
            </p>
            <p>
              Substring matching also keeps citations honest. Each hit comes
              back as{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                {"{ kind, id, matchedFields }"}
              </code>{" "}
              — not a similarity score and a chunk of text. The model can say
              it matched on the{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                tech
              </code>{" "}
              field of a specific role and the grounding stays tight. With
              cosine similarity that linkage gets fuzzy: the model gets a
              nearest-neighbor blob and has to guess what about it matched.
            </p>
            <p>
              The tradeoff: substring matching is brittle to typos and
              won&apos;t catch unrelated synonyms — &ldquo;PMP-style work&rdquo;
              will never hit &ldquo;project management&rdquo;. For a
              one-résumé corpus that&apos;s a non-issue; for a
              10,000-document knowledge base it would be the wrong call.{" "}
              <span className="font-medium text-text">
                Pick tooling that matches how much data you actually have.
              </span>
            </p>
          </div>
        </section>

        <section aria-labelledby="source" className="mt-12 border-t border-border-subtle pt-8">
          <h2 id="source" className="text-xl font-semibold tracking-tight text-text">
            Source
          </h2>
          <p className="mt-2 text-sm text-muted">Main files for this project:</p>
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
