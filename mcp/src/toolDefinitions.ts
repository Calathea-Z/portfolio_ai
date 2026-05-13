/** Tool names and descriptions aligned with `ResumeToolDefinitions.cs`. */

export const ToolNames = {
  GetRole: "get_role",
  SearchResume: "search_resume",
  ListProjectsBySkill: "list_projects_by_skill",
  GetMetrics: "get_metrics",
  ListRecentShipped: "list_recent_shipped",
  GetNarrative: "get_narrative",
  GetFaq: "get_faq",
} as const;

export type ToolName = (typeof ToolNames)[keyof typeof ToolNames];

export const toolDescriptions: Record<ToolName, string> = {
  [ToolNames.GetRole]:
    "Return one or more resume roles. Optionally filter by role id, employer/org name (case-insensitive substring), or a calendar year inside the role's tenure. With no filters, returns every role so the model can enumerate.",
  [ToolNames.SearchResume]:
    "Case-insensitive substring search across roles, projects, narrative fields, FAQ entries, and person summary/lookingFor/logistics fields. Returns kind (role, project, narrative, faq, or person), id, and which fields matched. Use when the visitor's wording does not map cleanly to get_role or list_projects_by_skill.",
  [ToolNames.ListProjectsBySkill]:
    "Return projects whose technology stack includes the named skill (case-insensitive). Use this when the visitor asks about which projects used a given technology or framework.",
  [ToolNames.GetMetrics]:
    "Return concrete quantitative metrics from the resume (years of experience, team sizes, etc.). Without 'id' returns all metrics; with 'id' returns just that one.",
  [ToolNames.ListRecentShipped]:
    "List recently shipped projects, newest first. Useful for 'what did you ship recently?' or year-scoped recap questions.",
  [ToolNames.GetNarrative]:
    "Return Zach's free-form career narrative (originStory, bridge, carryover). Use this for career-change / origin-story questions ('why did you leave kitchens?', 'how did you become an engineer?', 'what carries over from your prior career?') where structured role rows do not capture the answer. No inputs.",
  [ToolNames.GetFaq]:
    "Return pre-written FAQ entries. With no filters, returns every entry. Filter by stable id (e.g. 'next-role', 'why-chatbot', 'career-change', 'philosophy') or by case-insensitive keyword against question/answer text. Use this for predictable recruiter questions: what kind of role Zach wants next, why he built this chatbot, biggest accomplishment, learning approach, engineering philosophy.",
};
