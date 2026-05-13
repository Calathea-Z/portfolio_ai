# Portfolio Roadmap

**Goal:** A traditional portfolio site whose featured-projects section is where my AI engineering skills (agentic tool use, evals, observability, MCP) get demonstrated as evidence. Visitors come to learn about me — the AI demos exist to *prove* the capability claims I'm making, not to be the product.

**One-sentence pitch I'm aiming for:** *"I build agents, I observe them, I evaluate them, and I work at the protocol layer."*

## Mental model

Classic portfolio shape: **hero → about → chat hook → featured projects → experience → contact.** The chatbot stays prominent on the homepage as the "play with it for 30 seconds" interactive hook. The deeper AI work lives in the featured-projects section as click-throughs to dedicated project pages. Everything is in service of *"would I want to interview Zach?"*

**Every project page follows the same template:**

1. **What it is** — one line.
2. **Why I built it** — problem framing.
3. **What this shows about how I work** — the capability claim. *This is the line that keeps it a portfolio piece instead of a SaaS feature page.*
4. **Try it** — live demo.
5. **How it works** — architecture / tradeoffs.
6. **Source** — repo link.

Without item #3, every project page reads like a product. With it, every project page reads like evidence.

## Stack snapshot

- **Web:** Next.js App Router at `web/`. Homepage assembled from `<Hero />`, `<About />`, `<ChatSection />`, `<FeaturedProjects />`, `<Experience />`, `<Contact />` with a sticky nav. `lib/use-streaming-chat.ts` owns the SSE/NDJSON parse loop; `lib/projects.ts` is the source of truth for featured-projects cards. MCP install story lives on `/projects/mcp-server` and `mcp/README.md`.
- **API:** ASP.NET Core at `api/Portfolio.Api/`. `POST /chat` runs the agentic loop via `ChatOrchestrationService` + `AnthropicStreamService`, with `ResumeTools` registered through `ResumeToolDefinitions`. `POST /internal/chat-evals` (header-gated by `X-Eval-Key`) runs the same loop for deterministic eval runs. Per-IP rate limiting (`chat-per-ip`) + `DailyTokenBudgetService`. Prompts loaded by `SystemPromptLoader`.
- **Reuse:** every new endpoint chains `.RequireRateLimiting("chat-per-ip")` and shares the budget service. Don't reinvent.

---

## What's shipped ✅

The spine is in place. Don't re-litigate any of this.

- **Portfolio shell** — Hero, About, ChatSection, FeaturedProjects, Experience, Contact, StickyNav. Resume + email always one click away on desktop.
- **Agentic chat with tool use** — `AnthropicStreamService` runs the tool-use loop end-to-end. `ResumeTools` exposes `get_role`, `search_resume`, `list_projects_by_skill`, `get_metrics`, `list_recent_shipped`, `get_narrative`, `get_faq`. The UI renders each tool call as an expandable pill (`ToolCallPill.tsx`) inside the transcript. Project page at `/projects/agentic-chat`.
- **MCP resume server** — `mcp/` stdio server with the same seven tools and JSON input schemas parity-tested against `ResumeToolInputSchemas`. Project page at `/projects/mcp-server`; see `mcp/README.md` for Claude Desktop wiring.
- **Eval infrastructure** — `ChatEvalsController` and `ChatEvalsIntegrationTests` already drive the same orchestration through deterministic cases. The dashboard surface is the only missing piece (see Phase A below).
- **Trace span emission** — `trace_span` events already flow through the chat stream and are parsed by `chat-stream.ts`. Renderer is the only missing piece (see Phase B below).

---

## Phase A — Eval dashboard surface (half day)

The cheapest impressive win on the list. Engineering is done; this is a rendering job.

**Capability line:** *"I treat AI quality as engineering, not vibes."*

- [ ] **Cases file** — `evals/cases.json` with 8–12 questions, each tagged with criteria (`must_contain`, `must_not_contain`, `expected_tool_calls`). Include at least one intentional known-fail to narrate.
- [ ] **Runner** — `evals/run.mjs` hits `POST /internal/chat-evals` with the gate header, scores deterministic criteria locally, uses Haiku as judge for fuzzy ones, writes `evals/results.json` with timestamp + per-case pass/fail + failure transcript.
- [ ] **Dashboard** — embedded on `/projects/agentic-chat#evals`. Build-time read of `results.json` → pass/fail table, last-run timestamp, one narrated known-fail explaining what's broken and why I'm keeping it visible.
- [ ] (Optional) **GitHub Action** runs the runner on PRs and weekly cron.
- [ ] **Update capability copy** — `projects.ts` already mentions evals; make sure the agentic-chat page hero reads "agentic tool use *with evals*" rather than separating them.

**Done when:** `/projects/agentic-chat#evals` renders a pass/fail table with at least one narrated known-fail. The "I measure whether it actually works" claim is provable on the page.

---

## Phase B — Trace / observability viewer (2–3 days)

The single most differentiating piece on the whole roadmap. Almost nobody builds this.

**Capability line:** *"I treat AI as a distributed system — here are my spans."*

- [ ] **Span capture** — per `conversationId`, persist (or sign + blob) the `trace_span` stream so it can be replayed after the request ends. Lightweight store is fine (in-memory ring buffer keyed by conversation id + a `GET /chat/trace/{id}` endpoint). No DB.
- [ ] **Renderer** — `app/projects/trace-viewer/page.tsx`. Spans rendered as a flame chart or horizontal timeline: tool round-trips, model latency, reflection blocks, retries. Hover for span attributes; click for raw JSON.
- [ ] **Replay UX** — a "replay a saved conversation" selector with two or three canned demo conversations baked in (so the page works for visitors who didn't trigger a live chat).
- [ ] **Narration** — short copy explaining why traces beat vibes for agent quality and how this maps to prod observability (OpenTelemetry mental model). Link to the emitting code path in the repo.
- [ ] (Optional) **Diff two runs** side-by-side — only if Phase A and B both ship with time to spare.

**Done when:** a visitor can open the page, pick a conversation, and read the agent as a system of spans. The "almost no portfolio tells this story" pitch is literally true on your site.

---

## Phase C — MCP server (shipped in repo)

**Capability line:** *"I work at the protocol layer too — here's an MCP server exposing my resume tools."*

- [x] **`mcp/` folder** — Node + `@modelcontextprotocol/sdk`. Loads `resume.json` from `--data` (path or HTTPS URL); same canonical file as the API.
- [x] **Tool names mirror the chat exactly** — `get_role`, `search_resume`, `list_projects_by_skill`, `get_metrics`, `list_recent_shipped`, `get_narrative`, `get_faq`. Same contracts; `Portfolio.Api.Tests` asserts MCP schema JSON matches `ResumeToolInputSchemas`.
- [x] **README** with Claude Desktop / `claude_desktop_config.json` fragment and build instructions.
- [x] **Project page `/projects/mcp-server`** — capability framing, install snippet, placeholder for a short screencap.

**Done when:** `node mcp/dist/index.js --data …/resume.json` runs under an MCP client and answers questions using the same tools as the web chat. (Record a desktop demo when convenient.)

---

## Phase D — Polish + show-your-prompt (half day)

- [ ] **Prompt visibility** — on each project page that uses Claude, an expandable "📜 See the prompt" panel that loads from `SystemPromptLoader` with annotation comments around each section. Demystifies the demo and signals confidence.
- [ ] **Hero + About copy pass** — read it as a hiring manager. "Would I email this person?" If no, rewrite.
- [ ] **Capability lines audit** — every project card and project page has its line. No exceptions.
- [ ] **RAG mention in writing** — one sentence on the agentic-chat page explaining *why* I chose tool use over retrieval here (corpus fits in context, tool calls give traceable provenance). Lets the absence of a RAG demo land as judgment rather than gap.
- [ ] **Lighthouse + a11y pass** — the AI work shouldn't make the site slow or inaccessible.
- [ ] **Cut anything that doesn't earn its space.**

**Done when:** a hiring manager could land on `/`, scroll once, and decide to email me.

---

## Cut — and why

- **RAG-grounded resume search.** Cut. Agentic tool use already covers grounded-answers-with-citations for a corpus this size; layering retrieval on top would be performative. RAG over an *external* corpus would be a separate project that pulls focus from finishing what's distinctive. Demonstrate the judgment in one sentence on the agentic-chat page instead of building a half-baked demo.
- **Experience timeline (old Phase 7).** Cut. The existing Experience section + `/resume` page cover this. Doesn't differentiate, costs a day.
- **"Live build demo" (replay of Claude generating a component).** Cut. Gimmicky and doesn't demonstrate a skill the other phases don't already cover.
- **Standalone `/chat` page.** Defer. Homepage embed is the primary entry; a separate route is only worth it once Phase B's trace replay needs deep-linkable conversations.

## Suggested cadence

- **Day 1:** Phase A (eval dashboard).
- **Days 2–4:** Phase B (trace viewer).
- **Day 5:** Phase C (MCP server).
- **Day 6:** Phase D (polish + RAG-as-judgment sentence + capability audit).

Roughly one focused week from where the code currently sits.

## Things to deliberately *not* do

- **No DB just for chat history.** Stateless is fine for a portfolio.
- **No login walls.** Friction kills the demo.
- **No creepy analytics.** Aggregate counts only.
- **No blog CMS.** Out of scope.
- **No second AI demo that answers questions about Zach.** Three of those is the ceiling — chat (shipped), trace replay (a different lens on the same demo), MCP (same tools, different surface). Anything beyond that risks reading as "I built five chatbots about myself."
