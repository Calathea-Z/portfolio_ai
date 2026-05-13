import { readFile } from "node:fs/promises";
import path from "node:path";

export type EvalCriterion = {
  type: string;
  value?: unknown;
  description?: string;
  passed: boolean;
  reason?: string;
};

export type EvalCaseResult = {
  id: string;
  question: string;
  knownFail?: boolean;
  note?: string;
  passed: boolean;
  httpError?: string;
  streamError?: string;
  /** Tool names captured from the streamed tool_call events, in call order. */
  toolCalls?: string[];
  /** Truncated assistant transcript (text events joined). Helpful when a case fails. */
  transcript?: string;
  criteria: EvalCriterion[];
};

export type EvalResults = {
  timestamp: string;
  apiBaseUrl?: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    knownFails: number;
  };
  cases: EvalCaseResult[];
};

export async function loadEvalResults(): Promise<EvalResults | null> {
  try {
    const filePath = path.join(process.cwd(), "..", "evals", "results.json");
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as EvalResults;
  } catch {
    return null;
  }
}
