# zach.dev — monorepo

AI-powered developer portfolio: **Next.js** chat UI in `web/`, **.NET 8** streaming API in `api/`. The system prompt (your “resume”) lives in the API and is never sent from the browser.

## Layout

| Path       | Stack     | Role |
|------------|-----------|------|
| `web/`     | Next.js 16 | Chat UI, `/resume`, static `public/` (add `resume.pdf` here). |
| `api/`     | ASP.NET Core (.NET 8) | `POST /chat` → Anthropic Messages API (streaming). |

## Prerequisites

- Node 20+ and [pnpm](https://pnpm.io/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Environment

### API (`api/Portfolio.Api`)

Set the Anthropic API key (pick one):

```powershell
cd api\Portfolio.Api
dotnet user-secrets set "Anthropic:ApiKey" "YOUR_ANTHROPIC_API_KEY"
```

Or set environment variable `Anthropic__ApiKey`, or add to `appsettings.Development.json` locally (do not commit secrets).

Optional: override model in `appsettings.json` under `Anthropic` → `Model` (default `claude-sonnet-4-20250514`).

### Web (`web/`)

```powershell
cd web
copy .env.example .env.local
```

Edit `web/.env.local`:

- **`NEXT_PUBLIC_CHAT_API_URL`** — API base URL with **no** trailing slash, e.g. `http://localhost:5063` (must match a CORS origin allowed in `api/Portfolio.Api/Program.cs`).
- **`NEXT_PUBLIC_GITHUB_URL`**, **`NEXT_PUBLIC_LINKEDIN_URL`**, **`NEXT_PUBLIC_CONTACT_EMAIL`** — optional; placeholders are used if unset.

## Run locally

Terminal 1 — API (default HTTP URL is in `Properties/launchSettings.json`, profile `http`):

```powershell
cd api\Portfolio.Api
dotnet run --launch-profile http
```

Terminal 2 — web:

```powershell
cd web
pnpm dev
```

Open the URL Next prints (usually `http://localhost:3000`). Ensure `NEXT_PUBLIC_CHAT_API_URL` matches the API (`http://localhost:5063` unless you changed ports).

## Solution file

```powershell
dotnet build Portfolio.slnx
```

(`Portfolio.slnx` lives at the repo root.)

## PDF resume

Add your file as **`web/public/resume.pdf`**. The side panel and `/resume` page link to `/resume.pdf` until the file exists (link will 404 until then).

## Deploying

Run **two** services (or terminate TLS at a reverse proxy):

1. Host **`api`** with `Anthropic__ApiKey` (or `Anthropic:ApiKey`) set.
2. Host **`web`** with `NEXT_PUBLIC_CHAT_API_URL` pointing at the public API URL over **HTTPS** in production.

Update CORS in `api/Portfolio.Api/Program.cs` with your real production web origin (e.g. `https://zach.dev`).

## Editing the “resume”

Edit **`api/Portfolio.Api/Prompts/system-prompt.txt`** (embedded at build). Rebuild/restart the API after changes.
