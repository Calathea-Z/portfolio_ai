/**
 * Deterministic eval runner: POST each case to /internal/chat-evals, parse NDJSON,
 * score criteria locally, write results.json.
 *
 * Env:
 *   EVAL_API_BASE_URL — default http://localhost:5063
 *   EVAL_API_KEY — required (matches API Eval:ApiKey / X-Eval-Key header)
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseUrl = (process.env.EVAL_API_BASE_URL ?? "http://localhost:5063").replace(/\/$/, "");
const apiKey = process.env.EVAL_API_KEY;

if (!apiKey?.trim()) {
  console.error("EVAL_API_KEY is required (set to the same value as Eval:ApiKey in the API user secrets).");
  process.exit(1);
}

const casesPath = path.join(__dirname, "cases.json");
const resultsPath = path.join(__dirname, "results.json");

const casesRaw = JSON.parse(await readFile(casesPath, "utf8"));

/**
 * @typedef {{ type: string; value: string | string[]; description?: string }} CriterionInput
 * @typedef {{ id: string; question: string; known_fail?: boolean; note?: string; criteria: CriterionInput[] }} CaseInput
 */

/** @param {string} line */
function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

/**
 * @param {ReadableStream<Uint8Array>} body
 * @returns {Promise<{ transcript: string; toolCalls: string[]; streamError?: string }>}
 */
async function consumeNdjsonStream(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let transcript = "";
  /** @type {string[]} */
  const toolCalls = [];
  let streamError;

  const flushLine = (raw) => {
    const evt = parseLine(raw);
    if (!evt || typeof evt.kind !== "string") return;
    if (evt.kind === "text" && typeof evt.text === "string") {
      transcript += evt.text;
    }
    if (evt.kind === "tool_call" && typeof evt.name === "string") {
      toolCalls.push(evt.name);
    }
    if (evt.kind === "error" && typeof evt.message === "string") {
      streamError = evt.message;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      if (buffer) flushLine(buffer);
      break;
    }
    if (!value) continue;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      flushLine(line);
    }
  }

  return { transcript, toolCalls, streamError };
}

/**
 * @param {string} haystack
 * @param {string} needle
 */
function containsIgnoreCase(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/**
 * @param {CriterionInput} c
 * @param {{ transcript: string; toolCalls: string[] }} ctx
 */
function evaluateCriterion(c, ctx) {
  const { transcript, toolCalls } = ctx;
  const desc = c.description ?? `${c.type}: ${JSON.stringify(c.value)}`;

  if (c.type === "must_contain") {
    const v = typeof c.value === "string" ? c.value : "";
    const passed = v.length > 0 && containsIgnoreCase(transcript, v);
    return {
      type: c.type,
      value: c.value,
      description: desc,
      passed,
      reason: passed ? undefined : `Assistant text does not contain "${v}" (case-insensitive).`,
    };
  }

  if (c.type === "must_contain_any") {
    const alternatives = Array.isArray(c.value)
      ? c.value.filter((x) => typeof x === "string" && x.length > 0)
      : typeof c.value === "string" && c.value.length > 0
        ? [c.value]
        : [];
    const passed = alternatives.some((v) => containsIgnoreCase(transcript, v));
    return {
      type: c.type,
      value: c.value,
      description: desc,
      passed,
      reason: passed
        ? undefined
        : `Assistant text does not contain any of: ${alternatives.map((x) => `"${x}"`).join(", ")} (case-insensitive).`,
    };
  }

  if (c.type === "must_not_contain") {
    const v = typeof c.value === "string" ? c.value : "";
    const hit = v.length > 0 && containsIgnoreCase(transcript, v);
    const passed = !hit;
    return {
      type: c.type,
      value: c.value,
      description: desc,
      passed,
      reason: passed ? undefined : `Assistant text should not contain "${v}" but did.`,
    };
  }

  if (c.type === "expected_tool_calls") {
    const expected = Array.isArray(c.value) ? c.value : typeof c.value === "string" ? [c.value] : [];
    const missing = expected.filter((name) => !toolCalls.includes(name));
    const passed = missing.length === 0;
    return {
      type: c.type,
      value: c.value,
      description: desc,
      passed,
      reason: passed
        ? undefined
        : `Missing tool call(s): ${missing.join(", ")}. Saw: ${toolCalls.length ? toolCalls.join(", ") : "(none)"}.`,
    };
  }

  return {
    type: c.type,
    value: c.value,
    description: desc,
    passed: false,
    reason: `Unknown criterion type: ${c.type}`,
  };
}

/** @type {CaseInput[]} */
const cases = casesRaw;

/** @type {Awaited<ReturnType<typeof runOne>>[]} */
const caseResults = [];

for (const testCase of cases) {
  caseResults.push(await runOne(testCase));
}

const knownFails = caseResults.filter((r) => r.knownFail).length;
const failed = caseResults.filter((r) => !r.passed).length;
const passedCount = caseResults.filter((r) => r.passed).length;
const unexpectedFailures = caseResults.filter((r) => !r.passed && !r.knownFail).length;

const output = {
  timestamp: new Date().toISOString(),
  apiBaseUrl: baseUrl,
  summary: {
    total: caseResults.length,
    passed: passedCount,
    failed,
    knownFails,
  },
  cases: caseResults,
};

await writeFile(resultsPath, JSON.stringify(output, null, 2), "utf8");

console.log(
  `Evals: ${passedCount}/${caseResults.length} passed, ${failed} failed (${knownFails} known-fail). Wrote ${resultsPath}`
);

process.exit(unexpectedFailures === 0 ? 0 : 1);

/**
 * @param {CaseInput} testCase
 */
async function runOne(testCase) {
  const knownFail = Boolean(testCase.known_fail);
  const url = `${baseUrl}/internal/chat-evals`;

  let transcript = "";
  /** @type {string[]} */
  let toolCalls = [];
  let httpError;
  let streamError;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Eval-Key": apiKey.trim(),
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: testCase.question }],
      }),
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      httpError = `HTTP ${res.status}${bodyText ? `: ${bodyText.slice(0, 500)}` : ""}`;
    } else if (!res.body) {
      httpError = "No response body";
    } else {
      const parsed = await consumeNdjsonStream(res.body);
      transcript = parsed.transcript;
      toolCalls = parsed.toolCalls;
      streamError = parsed.streamError;
    }
  } catch (e) {
    httpError = e instanceof Error ? e.message : String(e);
  }

  if (httpError) {
    return {
      id: testCase.id,
      question: testCase.question,
      knownFail,
      note: testCase.note,
      passed: false,
      httpError,
      criteria: testCase.criteria.map((c) => ({
        type: c.type,
        value: c.value,
        description: c.description,
        passed: false,
        reason: "Request did not complete successfully.",
      })),
    };
  }

  if (streamError) {
    return {
      id: testCase.id,
      question: testCase.question,
      knownFail,
      note: testCase.note,
      passed: false,
      streamError,
      criteria: testCase.criteria.map((c) => ({
        type: c.type,
        value: c.value,
        description: c.description,
        passed: false,
        reason: `Stream error: ${streamError}`,
      })),
    };
  }

  const ctx = { transcript, toolCalls };
  const criteria = testCase.criteria.map((c) => evaluateCriterion(c, ctx));
  const passed = criteria.every((x) => x.passed);

  // Truncate transcript so results.json stays diff-friendly but a failed case still tells you why.
  const MAX_TRANSCRIPT_CHARS = 800;
  const transcriptPreview =
    transcript.length > MAX_TRANSCRIPT_CHARS
      ? `${transcript.slice(0, MAX_TRANSCRIPT_CHARS)}…`
      : transcript;

  return {
    id: testCase.id,
    question: testCase.question,
    knownFail,
    note: testCase.note,
    passed,
    toolCalls,
    transcript: transcriptPreview,
    criteria,
  };
}
