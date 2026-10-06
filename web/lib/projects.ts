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
  /** Short proof points for the Now section. Omitted on shipped cards. */
  highlights?: readonly string[];
  /** Public repo for this project's source. Falls back to the personal profile URL when unset. */
  repoUrl?: string;
};

const PORTFOLIO_REPO_URL = "https://github.com/Calathea-Z/portfolio_ai";

export const projects: Project[] = [
  {
    slug: "budgeting",
    title: "Budgeting and debt planning",
    blurb:
      "A personal project I am spending my time on: an app that helps people budget and manage debt from the accounts, paychecks, bills, and balances a household actually has. In progress, and not a public demo.",
    capability:
      "Next.js and a .NET API over PostgreSQL, with household-scoped sign-in, manual records, CSV import, and optional bank sync.",
    highlights: [
      "Home, accounts, transactions, income, bills, budgets, and debts are in the product today.",
      "A debt summary totals recorded balances, this month’s interest, minimums, and how much of known credit limits are in use.",
      "Bank linking is optional. A separate worker syncs connected accounts, and access tokens are encrypted before they are stored.",
    ],
    status: "in-progress",
    href: "/projects/budgeting",
  },
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

export function projectsByStatus(status: ProjectStatus): Project[] {
  return projects.filter((project) => project.status === status);
}
