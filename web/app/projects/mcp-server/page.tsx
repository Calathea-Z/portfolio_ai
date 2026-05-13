import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getProject } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

const project = getProject("mcp-server")!;

export const metadata: Metadata = {
  title: `${project.title} · ${siteConfig.name}`,
  description: project.blurb,
};

export default function McpServerProjectPage() {
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
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Featured project</p>
            <h1
              id="project-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl"
            >
              {project.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-secondary">
              <span className="font-medium text-primary">At a glance:</span> {project.capability}
            </p>
            <p className="mt-2 max-w-3xl text-base leading-relaxed text-secondary">{project.blurb}</p>
          </section>

          <section
            aria-labelledby="problem"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="problem" className="text-xl font-semibold tracking-tight text-text">
              What it is
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              A small Node.js stdio server using{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
                @modelcontextprotocol/sdk
              </code>
              . It registers the same seven tools the portfolio chat uses, reads the same{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
                resume.json
              </code>
              , and returns JSON tool results Claude Desktop (or any MCP client) can cite—no duplicate business logic
              in a second HTTP API.
            </p>
          </section>

          <section
            aria-labelledby="why"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="why" className="text-xl font-semibold tracking-tight text-text">
              Why I built it
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Recruiters and hiring managers increasingly live in agent hosts, not just browsers. MCP is the protocol
              those hosts use to attach structured capabilities. Shipping a server that exposes my résumé as tools is
              the smallest credible proof that I can work at the protocol layer—not only behind a bespoke SSE endpoint.
            </p>
          </section>

          <section
            aria-labelledby="capability"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Capability claim</p>
            <h2 id="capability" className="mt-2 text-xl font-semibold tracking-tight text-text">
              What this shows about how I work
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Contracts stay honest when one schema source feeds both surfaces. The .NET test suite loads{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
                mcp/schemas/*.json
              </code>{" "}
              and asserts deep equality with{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
                ResumeToolInputSchemas
              </code>
              , so Anthropic tool definitions and MCP tool definitions cannot drift silently. That is the same instinct
              as evals on the chat loop: make regressions a failing test, not a surprise in prod.
            </p>
          </section>

          <section aria-labelledby="try-it" className="mt-12">
            <h2 id="try-it" className="text-xl font-semibold tracking-tight text-text">
              Try it
            </h2>
            <p className="mt-2 text-sm text-secondary">
              Build the server, then wire Claude Desktop (or Claude Code) to run{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
                node dist/index.js
              </code>{" "}
              with{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
                --data
              </code>{" "}
              pointing at your checkout of{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
                resume.json
              </code>
              . Full copy-paste config lives in the repo README below.
            </p>
            <video
              width="100%"
              controls
              className="mt-4 rounded-lg border border-border-soft"
            >
              <source src="/videos/mcp-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-border-soft bg-code-bg p-4 text-left text-[12px] leading-relaxed text-code-fg">
{`"mcpServers": {
  "portfolio-resume": {
    "command": "node",
    "args": [
      "<absolute-path>/mcp/dist/index.js",
      "--data",
      "<absolute-path>/api/Portfolio.Api/Data/resume.json"
    ]
  }
}`}
            </pre>
            <p className="mt-3 text-xs text-muted">
              See{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[11px] text-code-fg">
                mcp/README.md
              </code>{" "}
              in the repository for build steps and notes.
            </p>
          </section>

          <section
            aria-labelledby="how"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="how" className="text-xl font-semibold tracking-tight text-text">
              How it works
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-secondary">
              <li>
                On startup the process parses{" "}
                <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                  --data
                </code>{" "}
                and loads JSON once (local path or HTTPS).
              </li>
              <li>
                <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                  tools/list
                </code>{" "}
                returns the seven tools with descriptions aligned to{" "}
                <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                  ResumeToolDefinitions
                </code>
                .
              </li>
              <li>
                <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                  tools/call
                </code>{" "}
                validates arguments (same shape as the API), runs the handler, and responds with a text content block
                containing JSON—matching what the chat loop expects from tool results.
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-mono">
              {["Node.js", "TypeScript", "MCP", "JSON Schema", ".NET parity tests"].map((tag) => (
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
            aria-labelledby="risks"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="risks" className="text-xl font-semibold tracking-tight text-text">
              Risks and tradeoffs
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Handlers are ported to TypeScript, so behavioral parity relies on tests and code review—not a shared
              library. The schema parity tests lock the wire contract; golden fixtures against the .NET{" "}
              <code className="rounded border border-border-subtle bg-code-bg px-1 font-mono text-[12px] text-code-fg">
                ResumeTools
              </code>{" "}
              would be the next tightening step if this grows.
            </p>
          </section>

          <section
            aria-labelledby="learnings"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="learnings" className="text-xl font-semibold tracking-tight text-text">
              What I learned
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              MCP wants stdio discipline: anything printed to stdout corrupts the JSON-RPC stream, so logging belongs on
              stderr. Keeping schemas as checked-in JSON files makes cross-language contract tests trivial compared to
              codegen from a single IDL—good enough for seven tools and a stable résumé payload.
            </p>
          </section>

          <section
            aria-labelledby="next"
            className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
          >
            <h2 id="next" className="text-xl font-semibold tracking-tight text-text">
              What is next
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Optional npm publish under a scoped name, plus a short recorded walkthrough for this page. If the
              handlers ever diverge, add shared JSON golden outputs from the API test suite and assert equality from
              both runtimes.
            </p>
          </section>

          <section aria-labelledby="source" className="mt-12 border-t border-border-subtle pt-8">
            <h2 id="source" className="text-xl font-semibold tracking-tight text-text">
              Source
            </h2>
            <p className="mt-2 text-sm text-muted">Main files for this project:</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[13px] text-code-fg">
                  mcp/src/index.ts
                </code>{" "}
                — stdio server and tool registration.
              </li>
              <li>
                <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[13px] text-code-fg">
                  mcp/src/resumeTools.ts
                </code>{" "}
                — tool handlers mirroring the API.
              </li>
              <li>
                <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[13px] text-code-fg">
                  mcp/schemas/*.json
                </code>{" "}
                — Anthropic-compatible input schemas shared with parity tests.
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
