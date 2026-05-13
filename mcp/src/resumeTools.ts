import type {
  ResumeData,
  ResumeFaqEntry,
  ResumeNarrative,
  ResumePerson,
  ResumeProject,
  ResumeRole,
} from "./resumeTypes.js";
import { ToolNames, type ToolName } from "./toolDefinitions.js";

function errorMessage(message: string): { error: string } {
  return { error: message };
}

function containsIgnoreCase(haystack: string | undefined | null, needle: string): boolean {
  if (haystack === undefined || haystack === null || haystack === "") return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function techEntryMatchesSkill(tech: string, skill: string): boolean {
  if (tech.toLowerCase() === skill.toLowerCase()) return true;
  if (skill.length < 2) return false;
  return tech.toLowerCase().includes(skill.toLowerCase());
}

function matchesRole(
  role: ResumeRole,
  id: string | undefined,
  org: string | undefined,
  year: number | undefined,
  currentYear: number
): boolean {
  if (id !== undefined && id !== null && role.id.toLowerCase() !== id.toLowerCase()) return false;
  if (org !== undefined && org !== null && !(role.org ?? "").toLowerCase().includes(org.toLowerCase()))
    return false;
  if (year !== undefined && year !== null) {
    const endYear = role.endYear ?? currentYear;
    if (year < role.startYear || year > endYear) return false;
  }
  return true;
}

function roleToObject(r: ResumeRole) {
  return {
    id: r.id,
    title: r.title ?? "",
    org: r.org ?? "",
    startYear: r.startYear,
    endYear: r.endYear ?? null,
    remote: r.remote ?? false,
    summary: r.summary ?? "",
    achievements: r.achievements ?? [],
    tech: r.tech ?? [],
    url: r.url ?? null,
  };
}

function projectToObject(p: ResumeProject) {
  return {
    id: p.id,
    name: p.name ?? "",
    roleId: p.roleId ?? null,
    year: p.year,
    status: p.status ?? "",
    visibility: p.visibility ?? null,
    url: p.url ?? null,
    repoUrl: p.repoUrl ?? null,
    demoUrl: p.demoUrl ?? null,
    summary: p.summary ?? "",
    outcomes: p.outcomes ?? [],
    tech: p.tech ?? [],
  };
}

function matchRoleFields(r: ResumeRole, query: string): string[] {
  const fields: string[] = [];
  if (containsIgnoreCase(r.title, query)) fields.push("title");
  if (containsIgnoreCase(r.org, query)) fields.push("org");
  if (containsIgnoreCase(r.summary, query)) fields.push("summary");
  if ((r.achievements ?? []).some((a) => containsIgnoreCase(a, query))) fields.push("achievements");
  if ((r.tech ?? []).some((t) => containsIgnoreCase(t, query))) fields.push("tech");
  return fields;
}

function matchProjectFields(p: ResumeProject, query: string): string[] {
  const fields: string[] = [];
  if (containsIgnoreCase(p.name, query)) fields.push("name");
  if (containsIgnoreCase(p.summary, query)) fields.push("summary");
  if ((p.outcomes ?? []).some((o) => containsIgnoreCase(o, query))) fields.push("outcomes");
  if ((p.tech ?? []).some((t) => containsIgnoreCase(t, query))) fields.push("tech");
  return fields;
}

function matchNarrativeFields(n: ResumeNarrative, query: string): string[] {
  const fields: string[] = [];
  if (containsIgnoreCase(n.originStory, query)) fields.push("originStory");
  if (containsIgnoreCase(n.bridge, query)) fields.push("bridge");
  if (containsIgnoreCase(n.carryover, query)) fields.push("carryover");
  return fields;
}

function matchFaqFields(f: ResumeFaqEntry, query: string): string[] {
  const fields: string[] = [];
  if (containsIgnoreCase(f.question, query)) fields.push("question");
  if (containsIgnoreCase(f.answer, query)) fields.push("answer");
  return fields;
}

function matchPersonFields(p: ResumePerson, query: string): string[] {
  const fields: string[] = [];
  if (containsIgnoreCase(p.summary, query)) fields.push("summary");
  if (containsIgnoreCase(p.lookingFor, query)) fields.push("lookingFor");
  if (containsIgnoreCase(p.availability, query)) fields.push("availability");
  if (containsIgnoreCase(p.workAuth, query)) fields.push("workAuth");
  if (containsIgnoreCase(p.timeZone, query)) fields.push("timeZone");
  if (containsIgnoreCase(p.compensation, query)) fields.push("compensation");
  if (containsIgnoreCase(p.portfolioSite, query)) fields.push("portfolioSite");
  if (containsIgnoreCase(p.email, query)) fields.push("email");
  if (containsIgnoreCase(p.github, query)) fields.push("github");
  if (containsIgnoreCase(p.linkedin, query)) fields.push("linkedin");
  if (containsIgnoreCase(p.freelanceSite, query)) fields.push("freelanceSite");
  if ((p.employmentTypes ?? []).some((t) => containsIgnoreCase(t, query))) fields.push("employmentTypes");
  return fields;
}

function normalizeArgs(raw: unknown): Record<string, unknown> {
  if (raw === undefined || raw === null) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
  return {};
}

export function runResumeTool(
  resume: ResumeData,
  tool: ToolName,
  args: unknown,
  currentYearUtc: number
): unknown {
  const input = normalizeArgs(args);

  switch (tool) {
    case ToolNames.GetRole: {
      const id = input.id !== undefined && input.id !== null ? String(input.id) : undefined;
      const org = input.org !== undefined && input.org !== null ? String(input.org) : undefined;
      const year =
        input.year !== undefined && input.year !== null && typeof input.year === "number"
          ? input.year
          : undefined;
      const roles = resume.roles ?? [];
      const matches = roles
        .filter((r) => matchesRole(r, id, org, year, currentYearUtc))
        .map(roleToObject);
      return { items: matches, count: matches.length };
    }
    case ToolNames.SearchResume: {
      const queryRaw = input.query;
      if (typeof queryRaw !== "string" || queryRaw.trim() === "")
        return errorMessage("'query' is required.");
      const query = queryRaw.trim();
      const items: { kind: string; id: string; matchedFields: string[] }[] = [];
      for (const r of resume.roles ?? []) {
        const matched = matchRoleFields(r, query);
        if (matched.length > 0) items.push({ kind: "role", id: r.id, matchedFields: matched });
      }
      for (const p of resume.projects ?? []) {
        const matched = matchProjectFields(p, query);
        if (matched.length > 0) items.push({ kind: "project", id: p.id, matchedFields: matched });
      }
      const narrative = resume.narrative ?? { originStory: "", bridge: "", carryover: "" };
      const narrativeMatched = matchNarrativeFields(narrative, query);
      if (narrativeMatched.length > 0)
        items.push({ kind: "narrative", id: "narrative", matchedFields: narrativeMatched });
      for (const f of resume.faq ?? []) {
        const matched = matchFaqFields(f, query);
        if (matched.length > 0) items.push({ kind: "faq", id: f.id, matchedFields: matched });
      }
      const person = resume.person ?? {};
      const personMatched = matchPersonFields(person, query);
      if (personMatched.length > 0)
        items.push({ kind: "person", id: "person", matchedFields: personMatched });
      return { query, items, count: items.length };
    }
    case ToolNames.ListProjectsBySkill: {
      const skillRaw = input.skill;
      if (typeof skillRaw !== "string" || skillRaw.trim() === "")
        return errorMessage("'skill' is required.");
      const skill = skillRaw.trim();
      const matches = (resume.projects ?? [])
        .filter((p) => (p.tech ?? []).some((t) => techEntryMatchesSkill(t, skill)))
        .map(projectToObject);
      return { skill, items: matches, count: matches.length };
    }
    case ToolNames.GetMetrics: {
      const id =
        input.id !== undefined && input.id !== null && String(input.id).trim() !== ""
          ? String(input.id).trim()
          : undefined;
      const metrics = resume.metrics ?? [];
      const filtered =
        id === undefined
          ? metrics
          : metrics.filter((m) => m.id.toLowerCase() === id.toLowerCase());
      const items = filtered.map((m) => ({
        id: m.id,
        label: m.label ?? "",
        value: m.value,
        unit: m.unit ?? "",
        note: m.note ?? null,
      }));
      return { items, count: items.length };
    }
    case ToolNames.ListRecentShipped: {
      let limit = input.limit !== undefined && input.limit !== null ? Number(input.limit) : 5;
      if (Number.isNaN(limit)) limit = 5;
      if (limit < 1) limit = 1;
      if (limit > 20) limit = 20;
      const items = (resume.projects ?? [])
        .filter((p) => (p.status ?? "").toLowerCase() === "shipped")
        .sort((a, b) => b.year - a.year)
        .slice(0, limit)
        .map(projectToObject);
      return { items, count: items.length, limit };
    }
    case ToolNames.GetNarrative: {
      const n = resume.narrative ?? { originStory: "", bridge: "", carryover: "" };
      return {
        originStory: n.originStory ?? "",
        bridge: n.bridge ?? "",
        carryover: n.carryover ?? "",
      };
    }
    case ToolNames.GetFaq: {
      let source = [...(resume.faq ?? [])];
      const idRaw = input.id;
      if (typeof idRaw === "string" && idRaw.trim() !== "") {
        const id = idRaw.trim();
        source = source.filter((f) => f.id.toLowerCase() === id.toLowerCase());
      }
      const kwRaw = input.keyword;
      if (typeof kwRaw === "string" && kwRaw.trim() !== "") {
        const kw = kwRaw.trim();
        source = source.filter(
          (f) => containsIgnoreCase(f.question, kw) || containsIgnoreCase(f.answer, kw)
        );
      }
      const items = source.map((f) => ({
        id: f.id,
        question: f.question ?? "",
        answer: f.answer ?? "",
      }));
      return { items, count: items.length };
    }
    default:
      return errorMessage(`Unknown tool '${String(tool)}'.`);
  }
}
