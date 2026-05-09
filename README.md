# zach.dev

Personal portfolio site with an AI chat that answers questions about my background — résumé context lives in the API, not the browser.

**Live:** [zach.dev](https://zach.dev)

## Stack

| Area | Tech |
|------|------|
| Frontend | Next.js 16, React, Tailwind CSS |
| Backend | ASP.NET Core (.NET 8), Anthropic Messages API (streaming) |
| Repo | Monorepo — `web/` (UI), `api/` (API) |

## What I built

- Streaming chat UI hooked to a small .NET service that holds the system prompt and talks to Claude.
- `/resume` and downloadable résumé assets under `web/public/`.

## Run it locally

Needs Node 20+, pnpm, and the .NET 8 SDK. API key via user secrets or env (`Anthropic__ApiKey`). Copy `web/.env.example` to `web/.env.local` and point `NEXT_PUBLIC_CHAT_API_URL` at your API (match CORS in `appsettings.json`).

```powershell
cd api\Portfolio.Api; dotnet run --launch-profile http
```

```powershell
cd web; pnpm dev
```
