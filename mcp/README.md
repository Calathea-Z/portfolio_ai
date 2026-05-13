# Portfolio resume MCP server

stdio [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the same seven structured resume tools as [`Portfolio.Api`](../api/Portfolio.Api/Services/ResumeTools.cs): `get_role`, `search_resume`, `list_projects_by_skill`, `get_metrics`, `list_recent_shipped`, `get_narrative`, `get_faq`. Tool names, descriptions, and JSON `input_schema` values are kept in sync with the .NET API via [`McpToolInputSchemaParityTests`](../api/Portfolio.Api.Tests/McpToolInputSchemaParityTests.cs).

**Data:** pass your `resume.json` path (or `https://` URL) with `--data`. The file is not bundled; use the same canonical file as the API, e.g. [`api/Portfolio.Api/Data/resume.json`](../api/Portfolio.Api/Data/resume.json).

## Prerequisites

- Node.js 18+
- Built output under `mcp/dist/` (run `npm run build` after clone)

## Build

```powershell
cd mcp
npm install
npm run build
```

## Run (stdio)

```powershell
node dist/index.js --data ..\api\Portfolio.Api\Data\resume.json
```

Dev (TypeScript directly):

```powershell
npm run dev -- --data ..\api\Portfolio.Api\Data\resume.json
```

## Claude Desktop (or Claude Code)

Add a server entry that runs Node with an **absolute** path to `dist/index.js` and to `resume.json`.

Example `claude_desktop_config.json` fragment (adjust paths for your machine):

```json
{
  "mcpServers": {
    "portfolio-resume": {
      "command": "node",
      "args": [
        "C:/Users/You/OneDrive/Desktop/Calathea/portfolio/mcp/dist/index.js",
        "--data",
        "C:/Users/You/OneDrive/Desktop/Calathea/portfolio/api/Portfolio.Api/Data/resume.json"
      ]
    }
  }
}
```

With Claude Code CLI you can use `claude mcp add` and point `command` / `args` at the same paths.

## Publishing

This package is **not** published to npm on day one; install from a git checkout or local path as above.
