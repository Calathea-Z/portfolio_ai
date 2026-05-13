# MCP Server — Build Plan

**Goal:** Ship the MCP server as the second featured project on the portfolio. Same resume tools as the web chat, exposed via Model Context Protocol.

**One-line pitch (say this out loud):** "My site has an AI chat that uses tools to answer questions about me. I took those exact same tools and exposed them through MCP — Anthropic's open standard — so anyone can plug them into Claude Desktop and ask about me there too. Same data, two protocols."

**Capability line for the project page:** *"I work at the protocol layer too — same tool contracts, two surfaces."*

---

## Why this project earns its spot

The agentic-chat page answers *"Can you build with Claude and prove it works?"* The MCP server answers a different question: *"Do you understand how AI capabilities get shared across clients, or do you only know how to wire up your own UI?"* Those are two different hiring signals, which is why two featured projects can hold up the section.

MCP is becoming table stakes for serious AI infra work in 2026. Shipping a server now — before it's universally expected — is the differentiator.

---

## Architecture decision: engine and data stay separate

The package is a generic MCP server that knows how to serve resume-shaped JSON. The `resume.json` data lives in the portfolio repo. The package and the data are decoupled.

**Why:** keeps personal data out of any package registry (where it would be permanent and trivially scrapable). Reframes the project as reusable infrastructure rather than "an npm package that is literally me." Reads as a real design call on the project page.

Install line ends up looking like:

```
node /path/to/mcp/dist/server.js --data /path/to/resume.json
```

(or `npx zach-resume-mcp --data https://zach.dev/resume.json` if you publish later — see Step 9.)

**Day-one decision: do not publish to npm.** Ship clone-and-run. Revisit npm publication once the project page is live and you've decided whether the install-line ergonomics are worth the publish-on-every-change workflow.

---

## Build steps

### Step 1 — Lock the small decisions before writing code

Two things to settle so you don't churn the README later:

- **Where does `mcp/` live?** At the repo root as a sibling of `api/` and `web/`. Matches existing layout.
- **Distribution?** Clone-and-run for day one. npm is a Step 9 question.

**Why:** decisions made after code is half-written cost more than decisions made first. Five minutes here saves a refactor.

**What this shows:** nothing visible — but it's why you don't have a stale README contradicting the code.

---

### Step 2 — Scaffold the `mcp/` package

Create `mcp/` at the repo root. Node + TypeScript + `@modelcontextprotocol/sdk`. Minimum structure:

```
mcp/
  package.json
  tsconfig.json
  src/
    server.ts        # entrypoint, wires the SDK to the tool registry
    data.ts          # loads resume JSON from path or URL
    tools/           # one file per tool
  README.md
```

No bundler. `tsc` to `dist/`, that's it.

**Why:** small surface area is the point. The MCP SDK already does the protocol work; your job is just to register tools and load data.

**What this shows:** taste — you didn't overbuild scaffolding for a single-purpose server.

---

### Step 3 — Port the seven resume tools

Mirror each tool from `api/Portfolio.Api/Services/ResumeTools.cs` one-to-one:
`get_role`, `search_resume`, `list_projects_by_skill`, `get_metrics`, `list_recent_shipped`, `get_narrative`, `get_faq`.

Same names. Same input schemas (port from `ResumeToolInputSchemas.cs`). Same return shapes. No redesigns — drift is the enemy of the "two surfaces, one contract" pitch.

**Why:** the tools are the product. Everything else is plumbing around them.

**What this shows:** that you can read a C# implementation and replicate its contract in TypeScript without losing fidelity — i.e., you understand the tools as specs, not as code.

---

### Step 4 — Contract-parity test

Write one small test that loads the C# schemas and the MCP schemas and asserts they are identical. Maybe 30 lines.

**Why:** "same tool contracts, two surfaces" is a slogan unless you can prove it. This test is the proof. It's also a regression guard — if you change one schema and forget the other, CI fails.

**What this shows:** that you treat protocol parity as something measurable, not aspirational. This is the sentence on the project page that lifts the project from "I shipped a thing" to "I engineered against drift."

---

### Step 5 — Manual sanity check in Claude Desktop

Add the server to your local Claude Desktop config. Ask it three or four resume questions. Watch the tools fire.

**Why:** tool descriptions are part of the prompt for the model. Models will pick the wrong tool if the descriptions are vague. You only learn this by watching it happen against the real client.

**What this shows:** that you tested with the actual client a recruiter would use — not just unit tests.

---

### Step 6 — Write the README

The hero of this file is the install snippet. A reader should be able to paste once and be talking to your resume.

Sections, in order:

1. One-paragraph "what this is."
2. The install snippet — the `claude mcp add` line plus the Claude Desktop config JSON.
3. The seven tools, one line each.
4. The architecture diagram (engine + data, same as the project page).
5. Link back to the project page.

**Why:** the README is what someone reads when they click through from GitHub. If they bounce, the project is invisible.

**What this shows:** that you can write docs for users, not just for yourself.

---

### Step 7 — Record the screencap

Thirty seconds. No narration. Claude Desktop, you type a question, the tool call fires visibly, the answer renders.

**Why:** seeing it is what makes a non-technical reader — a recruiter, a hiring manager — understand the project. Text doesn't.

**What this shows:** that the thing actually works. This is the artifact a recruiter watches.

---

### Step 8 — Build `/projects/mcp-server`

Use the standard 6-section project page template:

1. **What it is** — one line.
2. **Why I built it** — problem framing.
3. **What this shows about how I work** — the capability claim. *This is the line that keeps the page a portfolio piece instead of a SaaS feature page.*
4. **Try it** — install snippet + screencap.
5. **How it works** — architecture diagram + the "why two surfaces over one tool set" paragraph (below).
6. **Source** — repo link.

The architecture diagram is the single most important visual on the page: `resume.json` in the middle, two arrows out — one to the HTTP API powering the chat, one to the MCP server powering Claude Desktop.

The "why two surfaces" paragraph in plain English:

> *"The chat on this site needs to stream to a browser, so it talks HTTP and SSE. Claude Desktop and other agent runtimes don't speak my custom protocol — they speak MCP. Rather than write two different tool implementations and let them drift, the tools live in one place and both servers read the same JSON."*

**Why:** the project page **is** the project. The code is the proof. Spend at least a third of total time here.

**What this shows:** that you can frame your own work. Most engineering portfolios cannot.

---

### Step 9 — Flip the switch on the homepage

In `web/lib/projects.ts`, change the `mcp-server` entry from `status: "planned"` to `status: "shipped"`. Update the blurb or capability line if it needs sharpening now that the page exists.

**Why:** otherwise the homepage card still says "planned" and the live page is effectively invisible.

**What this shows:** that you finish — which sounds trivial until you scroll through other people's portfolios and see how many are 60% shipped.

---

### Step 10 — Repo cleanup

Delete `web/app/projects/trace-viewer/`. It's dead, it's not registered in `projects.ts`, and a repo where on-disk reality doesn't match the source of truth is a smell a recruiter will notice on GitHub.

Update or replace `ROADMAP.md`. It currently still describes the cut trace viewer and the standalone eval dashboard. Either rewrite it to reflect the two-project reality or delete it — having both a stale roadmap and a current plan in the repo is worse than having neither.

**Why:** a recruiter who lands on your GitHub and sees a project folder that doesn't appear on your site reads "didn't finish" — even when the truth is "decided not to."

**What this shows:** that your repo state reflects your design decisions, not your historical aspirations.

---

## How to explain this in one minute (interview script)

If a recruiter asks: *"What's this MCP server?"*

> "MCP is Anthropic's open standard for connecting language models to tools and data. My portfolio site already has a chat that uses seven structured tools to answer questions about me — tools like 'search resume' and 'list projects by skill.' The MCP server exposes those exact same tools through MCP, so somebody using Claude Desktop can ask questions about me with the same tools my site uses. Same data file, same tool contracts, two protocols. The interesting part isn't the code — it's the design call to separate the tools as specs from the surface that delivers them."

If they push: *"Why does that matter?"*

> "Because 2026 is the year MCP becomes table stakes for AI tooling. Shipping a server now signals I work at the protocol layer, not just the prompt layer."

---

## Suggested cadence

- **Morning:** Steps 1–5 (scaffold, port tools, parity test, sanity check). About four hours.
- **Afternoon:** Steps 6–8 (README, screencap, project page). The page is where most of the value lives.
- **End of day:** Steps 9–10 (flip the switch, repo cleanup).

One focused day from where the code currently sits.

---

## Things to deliberately *not* do

- **Don't bundle `resume.json` inside the MCP package.** Data and engine stay separate. See the architecture decision above.
- **Don't publish to npm on day one.** Ship clone-and-run. Revisit later if the install-line ergonomics start to matter.
- **Don't add an eighth tool just because MCP makes it easy.** Tool parity with the C# side is the pitch; expanding the surface on the MCP side breaks the symmetry.
- **Don't write a CLI flag for every config knob.** Two flags max: `--data` and maybe `--log-level`. Anything more is overengineering a 100-line server.
