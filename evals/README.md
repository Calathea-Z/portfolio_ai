# Portfolio chat evals

Deterministic checks against `POST /internal/chat-evals` (same NDJSON stream as production chat, with usage enabled and daily budget skipped).

## Prerequisites

1. **API running** with a valid Anthropic key (see repo root `README.md`).
2. **Eval API key** set on the API (user secrets or env), e.g.:

   ```powershell
   cd api\Portfolio.Api
   dotnet user-secrets set Eval:ApiKey "your-eval-secret-here"
   ```

3. **Node 20+**

## Run

From this directory:

```powershell
$env:EVAL_API_KEY = "your-eval-secret-here"   # must match Eval:ApiKey
$env:EVAL_API_BASE_URL = "http://localhost:5063"   # optional; default shown
npm run evals
```

This reads `cases.json`, posts each question, scores criteria in `run.mjs`, and writes `results.json`.

**Criteria types:** `expected_tool_calls` (string or array), `must_contain`, `must_contain_any` (array of substrings — any match passes), `must_not_contain`.

- Exit code **0** when every failure is a case marked `known_fail` in `cases.json`.
- Exit code **1** if any non–known-fail case fails (or HTTP/stream errors).

The Next.js project page at `/projects/agentic-chat#evals` imports `results.json` at build time; re-run evals before deploy to refresh the dashboard.
