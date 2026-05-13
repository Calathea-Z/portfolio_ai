import type { ToolName } from "./toolDefinitions.js";
import { ToolNames } from "./toolDefinitions.js";

function validationPayload(details: string): { error: string; details: string } {
  return { error: "validation_failed", details };
}

function assertPlainObject(raw: unknown): Record<string, unknown> | null {
  if (raw === undefined || raw === null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function extraKeys(obj: Record<string, unknown>, allowed: Set<string>): string | null {
  for (const k of Object.keys(obj)) {
    if (!allowed.has(k)) return `additional property '${k}' not allowed`;
  }
  return null;
}

function asString(v: unknown, field: string): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return `${field} must be a string`;
  return null;
}

function asOptionalString(v: unknown, field: string): string | null {
  if (v === undefined || v === null) return null;
  return asString(v, field);
}

function asOptionalInt(v: unknown, field: string): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== "number" || !Number.isInteger(v)) return `${field} must be an integer`;
  return null;
}

function asRequiredString(v: unknown, field: string): string | null {
  if (v === undefined || v === null) return `${field} is required`;
  return asString(v, field);
}

/**
 * Validates tool arguments like `ResumeToolInputValidator` + JSON Schema.
 * Returns `null` if valid, otherwise a payload matching C# `ValidationError`.
 */
export function validateToolArguments(
  tool: ToolName,
  raw: unknown
): { error: string; details: string } | null {
  const obj = assertPlainObject(raw);
  if (obj === null) return validationPayload("arguments must be a JSON object");

  switch (tool) {
    case ToolNames.GetRole: {
      const allowed = new Set(["id", "year", "org"]);
      const xk = extraKeys(obj, allowed);
      if (xk) return validationPayload(xk);
      const e1 = asOptionalString(obj.id, "id");
      if (e1) return validationPayload(e1);
      const e2 = asOptionalInt(obj.year, "year");
      if (e2) return validationPayload(e2);
      const e3 = asOptionalString(obj.org, "org");
      if (e3) return validationPayload(e3);
      return null;
    }
    case ToolNames.SearchResume: {
      const allowed = new Set(["query"]);
      const xk = extraKeys(obj, allowed);
      if (xk) return validationPayload(xk);
      const e = asRequiredString(obj.query, "query");
      if (e) return validationPayload(e);
      return null;
    }
    case ToolNames.ListProjectsBySkill: {
      const allowed = new Set(["skill"]);
      const xk = extraKeys(obj, allowed);
      if (xk) return validationPayload(xk);
      const e = asRequiredString(obj.skill, "skill");
      if (e) return validationPayload(e);
      return null;
    }
    case ToolNames.GetMetrics: {
      const allowed = new Set(["id"]);
      const xk = extraKeys(obj, allowed);
      if (xk) return validationPayload(xk);
      const e = asOptionalString(obj.id, "id");
      if (e) return validationPayload(e);
      return null;
    }
    case ToolNames.ListRecentShipped: {
      const allowed = new Set(["limit"]);
      const xk = extraKeys(obj, allowed);
      if (xk) return validationPayload(xk);
      if (obj.limit !== undefined && obj.limit !== null) {
        if (typeof obj.limit !== "number" || !Number.isInteger(obj.limit))
          return validationPayload("limit must be an integer");
        const lim = obj.limit as number;
        if (lim < 1 || lim > 20) return validationPayload("limit must be between 1 and 20");
      }
      return null;
    }
    case ToolNames.GetNarrative: {
      const allowed = new Set<string>([]);
      const xk = extraKeys(obj, allowed);
      if (xk) return validationPayload(xk);
      return null;
    }
    case ToolNames.GetFaq: {
      const allowed = new Set(["id", "keyword"]);
      const xk = extraKeys(obj, allowed);
      if (xk) return validationPayload(xk);
      const e1 = asOptionalString(obj.id, "id");
      if (e1) return validationPayload(e1);
      const e2 = asOptionalString(obj.keyword, "keyword");
      if (e2) return validationPayload(e2);
      return null;
    }
    default:
      return validationPayload("unknown tool");
  }
}
