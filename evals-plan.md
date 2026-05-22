# Evals Dashboard Implementation Plan

## Purpose

Demonstrate that you measure AI quality systematically, not by vibes. This is production-grade practice: real AI teams at Anthropic, OpenAI, and Google evaluate their agents deterministically. You're proving you think like that.

**Capability claim:** "I treat AI quality as engineering, not vibes."

---

## Phase A: Evals Dashboard (half day)

### Step 1: Create `evals/cases.json`
**File:** `evals/cases.json`

Write 8–12 test cases. Each case:
- `id`: unique name (e.g., "role-lookup", "skill-search")
- `question`: the user query to ask the chat
- `criteria`: array of pass/fail rules
  - `type`: one of `must_contain`, `must_not_contain`, `expected_tool_calls`
  - `value`: the string to match or tool name
  - `description`: what this tests

**Include one intentional known-fail** (e.g., a case where the chat needs to handle ambiguity and you expect it to struggle). You'll narrate why it fails on the dashboard.

**Example structure:**
```json
[
  {
    "id": "recent-projects",
    "question": "What are my three most recent shipped projects?",
    "criteria": [
      { "type": "expected_tool_calls", "value": "list_recent_shipped", "description": "Must call the right tool" },
      { "type": "must_contain", "value": "agentic-chat", "description": "agentic-chat is recent" }
    ]
  },
  {
    "id": "known-fail-ambiguous-skill",
    "question": "Do I know about databases?",
    "criteria": [
      { "type": "must_contain", "value": "clarify", "description": "Should ask what kind of DB (intentional fail - tests fuzzy reasoning)" }
    ]
  }
]
```

### Step 2: Create `evals/run.mjs`
**File:** `evals/run.mjs`

A Node script that:
1. Loads `evals/cases.json`
2. For each case:
   - POSTs the question to `POST /internal/chat-evals` with the `X-Eval-Key` header
   - Gets back a response
   - Scores deterministic criteria locally (string matching, regex)
   - Uses Claude Haiku to score fuzzy criteria (e.g., "does this response show understanding?")
3. Writes results to `evals/results.json`:
   ```json
   {
     "timestamp": "2026-05-13T14:32:00Z",
     "cases": [
       {
         "id": "recent-projects",
         "passed": true,
         "criteria": [
           { "value": "list_recent_shipped", "passed": true },
           { "value": "agentic-chat", "passed": true }
         ]
       },
       {
         "id": "known-fail-ambiguous-skill",
         "passed": false,
         "reason": "Response did not ask for clarification on database type"
       }
     ]
   }
   ```

**Run with:** `npm run evals` (add script to `package.json` in `/evals`)

### Step 3: Update `/projects/agentic-chat/page.tsx`
**File:** `web/app/projects/agentic-chat/page.tsx`

1. At the bottom (or as a new section), add an `#evals` anchor:
   ```jsx
   <section aria-labelledby="evals" className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
     <h2 id="evals" className="text-xl font-semibold tracking-tight text-text">
       Evals
     </h2>
     {/* Import results.json at build time and render pass/fail table */}
   </section>
   ```

2. Import `evals/results.json` and render:
   - A table: Case name | Status (✓ or ✗) | Last run timestamp
   - A narration of one known-fail case explaining why it fails and what you'd fix

**Example:**
```
| Case | Status | Notes |
|------|--------|-------|
| recent-projects | ✓ | Correctly identified three projects |
| skill-search | ✓ | Tool calls matched expectations |
| known-fail-ambiguous-skill | ✗ | Expected failure: doesn't ask for DB clarification when ambiguous |
```

With narrative: "This one intentionally fails because the chat needs deeper reasoning about follow-ups. I'm tracking it rather than hiding it — part of the discipline."

### Step 4: Update `lib/projects.ts`
**File:** `web/lib/projects.ts`

Find the agentic-chat project entry and update:
- From: `"agentic tool use"`
- To: `"agentic tool use *with evals*"`

This signals on the homepage and featured projects that the demo includes measurement.

---

## Done When

- [ ] `evals/cases.json` has 8–12 cases + 1 known-fail
- [ ] `evals/run.mjs` runs without errors and produces `results.json`
- [ ] `/projects/agentic-chat/page.tsx` has `#evals` section rendering the table
- [ ] One known-fail case is narrated on the page
- [ ] `projects.ts` mentions evals in the capability line
- [ ] `npm run evals` produces a fresh results.json

---

## Optional Next Steps (not required for done)

- GitHub Action: Run evals on PR and weekly cron
- Trend tracking: Compare results over time
- More cases: Scale from 12 to 20–30 as the chat evolves
