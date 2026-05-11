/**
 * Source of truth for featured portfolio projects.
 *
 * Each entry powers a card in the homepage Featured Projects section and
 * (eventually) its dedicated project page at the `href` route. The
 * `capability` field is the framing line shown under the title — it's what
 * separates a portfolio piece from a product page.
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
    slug: "rag-resume",
    title: "RAG-grounded resume search",
    blurb:
      "Chunk the resume and supporting writeups, embed them, and answer every question from retrieved context — with the chunks and similarity scores on display.",
    capability:
      "I understand retrieval, not just prompting — every answer is grounded in chunks the visitor can inspect.",
    status: "planned",
    href: "/projects/rag-resume",
  },
  {
    slug: "agentic-chat",
    title: "Agentic chat with tool use",
    blurb:
      "Claude calls structured tools (get_role, list_projects_by_skill, get_metrics) over a streaming loop, and you can watch each tool call in the transcript.",
    capability:
      "I build agentic AI, not chat wrappers — the model calls structured tools and you can watch it happen.",
    status: "planned",
    href: "/projects/agentic-chat",
  },
  {
    slug: "pr-review",
    title: "PR Reviewer",
    blurb:
      "Paste a diff, get a rubric-driven review grouped by severity (correctness, perf, security, style, testing) — streamed back inline.",
    capability:
      "I ship AI tools that engineering teams actually adopt — here's the simplest version of what I mean.",
    status: "planned",
    href: "/projects/pr-review",
  },
  {
    slug: "mcp-server",
    title: "MCP server for resume tools",
    blurb:
      "An MCP server that exposes the same resume tools as the chat — wire it into Claude Desktop with `claude mcp add` and ask questions about me there.",
    capability:
      "I work at the protocol layer too — here's an MCP server exposing my resume tools.",
    status: "planned",
    href: "/projects/mcp-server",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
