import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { ResumeData } from "./resumeTypes.js";
import { runResumeTool } from "./resumeTools.js";
import { toolDescriptions, ToolNames, type ToolName } from "./toolDefinitions.js";
import { validateToolArguments } from "./validation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const toolOrder: ToolName[] = [
  ToolNames.GetRole,
  ToolNames.SearchResume,
  ToolNames.ListProjectsBySkill,
  ToolNames.GetMetrics,
  ToolNames.ListRecentShipped,
  ToolNames.GetNarrative,
  ToolNames.GetFaq,
];

function isToolName(s: string): s is ToolName {
  return (Object.values(ToolNames) as string[]).includes(s);
}

function parseDataPath(argv: string[]): string | null {
  for (let i = 0; i < argv.length - 1; i++) {
    if (argv[i] === "--data") return argv[i + 1] ?? null;
  }
  return null;
}

async function loadResumeJson(dataPath: string): Promise<ResumeData> {
  const trimmed = dataPath.trim();
  let text: string;
  if (/^https?:\/\//i.test(trimmed)) {
    const res = await fetch(trimmed);
    if (!res.ok) throw new Error(`Failed to fetch resume JSON: HTTP ${res.status}`);
    text = await res.text();
  } else {
    text = readFileSync(trimmed, "utf8");
  }
  return JSON.parse(text) as ResumeData;
}

function readInputSchema(tool: ToolName): Record<string, unknown> {
  const schemaPath = join(__dirname, "..", "schemas", `${tool}.json`);
  const raw = readFileSync(schemaPath, "utf8");
  return JSON.parse(raw) as Record<string, unknown>;
}

function toolTextResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload) }],
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const dataPath = parseDataPath(argv);
  if (!dataPath) {
    console.error("Usage: node dist/index.js --data <path-or-https-url-to-resume.json>");
    process.exit(1);
  }

  const resume = await loadResumeJson(dataPath);
  const currentYearUtc = new Date().getUTCFullYear();

  const tools = toolOrder.map((name) => ({
    name,
    description: toolDescriptions[name],
    inputSchema: readInputSchema(name),
  }));

  const server = new Server({ name: "portfolio-resume-mcp", version: "0.1.0" }, {
    capabilities: { tools: {} },
  });

  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments;

    if (!isToolName(name)) {
      return toolTextResult({ error: `Unknown tool '${name}'.` });
    }

    const validation = validateToolArguments(name, args);
    if (validation) {
      return toolTextResult(validation);
    }

    const result = runResumeTool(resume, name, args, currentYearUtc);
    return toolTextResult(result);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
