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
  /** Public repo for this project's source. Falls back to the personal profile URL when unset. */
  repoUrl?: string;
};

const PORTFOLIO_REPO_URL = "https://github.com/Calathea-Z/portfolio_ai";

export const projects: Project[] = [
  {
    slug: "planning-poker",
    title: "Planning Poker — internal collaboration tool",
    blurb:
      "Real-time estimation platform for distributed delivery teams at Forvis Mazars, integrated with Jira for viewing stories and updating estimates. Replaced manual estimation coordination with a single internal workflow that improved session consistency and reduced meeting friction.",
    capability:
      "0-to-1 internal product: React/TypeScript, WebSocket realtime, Jira integration, .NET services — adopted across all verticals.",
    status: "shipped",
    href: "/projects/planning-poker",
  },
  {
    slug: "calathea",
    title: "Calathea — commerce & CMS client work",
    blurb:
      "Production marketing and e-commerce sites for small-business clients: responsive React/Next.js UIs, custom CMS editorial workflows, API integrations, and Vercel deployment — owned end-to-end from discovery through launch.",
    capability:
      "Public product engineering: commerce/CMS workflows, responsive UI, API integration, and production ownership on Vercel.",
    status: "shipped",
    href: "/projects/calathea",
  },
  {
    slug: "agentic-chat",
    title: "Agentic chat with tool use + evals",
    blurb:
      "Streaming chat where Claude calls seven structured resume tools (get_role, search_resume, list_projects_by_skill, get_metrics, list_recent_shipped, get_narrative, get_faq). Tool calls show up in the transcript. Evals hit the same HTTP endpoint; results power the pass/fail table on the project page.",
    capability:
      "Structured tool use over real data, with evals so regressions show up as failing rows—not just a prettier UI.",
    status: "shipped",
    href: "/projects/agentic-chat",
    repoUrl: PORTFOLIO_REPO_URL,
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
    repoUrl: `${PORTFOLIO_REPO_URL}/tree/main/mcp`,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
