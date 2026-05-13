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
    title: "Agentic chat with tool use",
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
      "Same resume tools as the web chat, exposed over the Model Context Protocol so they can run from Claude Desktop or other MCP clients—one data file, two ways to call it.",
    capability:
      "Same tool contracts over HTTP and MCP when you need the protocol surface, not a second bespoke integration.",
    status: "planned",
    href: "/projects/mcp-server",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
