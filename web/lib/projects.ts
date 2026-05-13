/**
 * Source of truth for featured portfolio projects.
 *
 * Each entry powers a card in the homepage Featured Projects section and
 * (eventually) its dedicated project page at the `href` route. The
 * `capability` field is a one-line takeaway on each card.
 */

export type ProjectStatus = "planned" | "in-progress" | "shipped";

export type Project = {
  slug: string;
  title: string;
  blurb: string;
  capability: string;
  status: ProjectStatus;
  href: string;
};

export const projects: Project[] = [
  {
    slug: "agentic-chat",
    title: "Agentic chat with tool use + evals",
    blurb:
      "Streaming chat where Claude calls seven structured resume tools (get_role, search_resume, list_projects_by_skill, get_metrics, list_recent_shipped, get_narrative, get_faq). Tool calls show up in the transcript. Evals hit the same HTTP endpoint; results power the pass/fail table on the project page.",
    capability:
      "Structured tool use over real data, with evals so regressions show up as failing rows—not just a prettier UI.",
    status: "shipped",
    href: "/projects/agentic-chat",
  },
  {
    slug: "mcp-server",
    title: "MCP server for resume tools",
    blurb:
      "Same seven resume tools as the web chat, exposed over the Model Context Protocol for Claude Desktop and other MCP hosts—load the same resume.json, get the same JSON tool results. Schema files are parity-tested against the .NET API so contracts cannot drift quietly.",
    capability:
      "Protocol-layer surface for the same tool contracts as the chat loop, with cross-language schema parity tests—not a second ad hoc integration.",
    status: "shipped",
    href: "/projects/mcp-server",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
