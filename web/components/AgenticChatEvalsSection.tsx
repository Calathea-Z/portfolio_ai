import { Fragment } from "react";
import type { EvalCaseResult, EvalCriterion, EvalResults } from "@/lib/eval-results";

type Props = {
  results: EvalResults | null;
};

function statusPill(c: EvalCaseResult) {
  if (c.passed) {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        Pass
      </span>
    );
  }
  if (c.knownFail) {
    return (
      <span className="inline-flex rounded-full border border-amber-500/45 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
        Known fail
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
      Fail
    </span>
  );
}

function formatCriterionSummary(c: EvalCaseResult) {
  if (c.httpError) return c.httpError;
  if (c.streamError) return c.streamError;
  const n = c.criteria?.length ?? 0;
  const ok = c.criteria?.filter((x) => x.passed).length ?? 0;
  return `${ok}/${n} checks`;
}

function formatCriterionValue(value: EvalCriterion["value"]): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (value === undefined || value === null) return "—";
  return JSON.stringify(value);
}

function CaseDetails({ c }: { c: EvalCaseResult }) {
  const hasToolCalls = (c.toolCalls?.length ?? 0) > 0;
  const hasTranscript = Boolean(c.transcript?.trim());

  return (
    <details className="group" open={!c.passed && !c.knownFail}>
      <summary className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted hover:text-text">
        <span className="transition-transform group-open:rotate-90">›</span>
        Details
      </summary>
      <div className="mt-3 space-y-3 rounded-lg border border-border-subtle bg-surface-alt/60 p-3">
        <p className="text-xs leading-snug text-secondary">
          <span className="font-semibold text-text">Question:</span> {c.question}
        </p>

        <div className="text-xs">
          <p className="font-semibold text-text">Tool calls</p>
          {hasToolCalls ? (
            <ul className="mt-1 flex flex-wrap gap-1">
              {c.toolCalls!.map((name, idx) => (
                <li
                  key={`${name}-${idx}`}
                  className="rounded border border-border-subtle bg-code-bg px-1.5 py-0.5 font-mono text-[11px] text-code-fg"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-muted">(none — model answered without calling a resume tool)</p>
          )}
        </div>

        <div className="text-xs">
          <p className="font-semibold text-text">Criteria</p>
          <ul className="mt-1 space-y-1">
            {c.criteria.map((cr, idx) => (
              <li
                key={`${cr.type}-${idx}`}
                className={cr.passed ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}
              >
                <span className="font-semibold">{cr.passed ? "Pass" : "Fail"}</span>{" "}
                <span className="font-mono text-[11px]">{cr.type}</span>
                <span className="text-muted"> · {formatCriterionValue(cr.value)}</span>
                {cr.description ? <span className="text-secondary"> — {cr.description}</span> : null}
                {!cr.passed && cr.reason ? <div className="ml-4 text-muted">↳ {cr.reason}</div> : null}
              </li>
            ))}
          </ul>
        </div>

        {hasTranscript ? (
          <div className="text-xs">
            <p className="font-semibold text-text">Assistant transcript (truncated)</p>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded border border-border-subtle bg-code-bg p-2 font-mono text-[11px] leading-relaxed text-code-fg">
              {c.transcript}
            </pre>
          </div>
        ) : null}

        {c.httpError ? (
          <p className="text-xs text-red-700 dark:text-red-400">
            <span className="font-semibold">HTTP error:</span> {c.httpError}
          </p>
        ) : null}
        {c.streamError ? (
          <p className="text-xs text-red-700 dark:text-red-400">
            <span className="font-semibold">Stream error:</span> {c.streamError}
          </p>
        ) : null}
      </div>
    </details>
  );
}

export function AgenticChatEvalsSection({ results }: Props) {
  if (!results) {
    return (
      <section
        id="evals"
        aria-labelledby="evals-heading"
        className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
      >
        <h2 id="evals-heading" className="text-xl font-semibold tracking-tight text-text">
          Evals
        </h2>
        <p className="mt-3 text-sm text-secondary">
          No eval results found. From the repo root, configure{" "}
          <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
            Eval:ApiKey
          </code>{" "}
          on the API, start the API, then run{" "}
          <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
            npm run evals
          </code>{" "}
          in{" "}
          <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
            evals/
          </code>{" "}
          to generate{" "}
          <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
            results.json
          </code>
          .
        </p>
      </section>
    );
  }

  const { summary, timestamp, apiBaseUrl, cases } = results;
  const knownFailCase = cases.find((c) => c.knownFail);

  return (
    <section
      id="evals"
      aria-labelledby="evals-heading"
      className="mt-12 rounded-2xl border border-border-soft bg-surface p-6 shadow-sm"
    >
      <h2 id="evals-heading" className="text-xl font-semibold tracking-tight text-text">
        Evals
      </h2>
      <p className="mt-2 text-sm text-secondary">
        Every row is a deterministic check against the same{" "}
        <code className="rounded border border-border-subtle bg-code-bg px-1 py-0.5 font-mono text-[12px] text-code-fg">
          POST /internal/chat-evals
        </code>{" "}
        stream as the live chat (usage on, daily budget off). Expand a row to see the tool calls, criteria
        breakdown, and a transcript preview of the assistant&rsquo;s actual reply.
      </p>
      <p className="mt-2 text-xs text-muted">
        Last run · {new Date(timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        {apiBaseUrl ? ` · API ${apiBaseUrl}` : null} · {summary.passed}/{summary.total} green · {summary.knownFails}{" "}
        known-fail suite
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-lg border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border-soft text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="py-2 pr-4">Case</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Criteria</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <Fragment key={c.id}>
                <tr className="border-b border-border-subtle/60">
                  <td className="py-3 pr-4 align-top font-mono text-[13px] text-text">{c.id}</td>
                  <td className="py-3 pr-4 align-top">{statusPill(c)}</td>
                  <td className="py-3 pr-4 align-top text-secondary">{formatCriterionSummary(c)}</td>
                  <td className="py-3 align-top text-muted">{c.note ?? "—"}</td>
                </tr>
                <tr className="border-b border-border-subtle/80 last:border-0">
                  <td colSpan={4} className="px-1 pb-3">
                    <CaseDetails c={c} />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {knownFailCase ? (
        <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 dark:bg-amber-500/10">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-200">
            Known-fail (intentional)
          </p>
          <p className="mt-2 text-sm font-medium text-text">
            <span className="font-mono text-[13px] text-primary">{knownFailCase.id}</span>
            {" — "}
            <span className="text-secondary">&ldquo;{knownFailCase.question}&rdquo;</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-secondary">
            {knownFailCase.note ??
              "This case is expected to miss an ideal behavior so the dashboard shows honest gaps instead of only green rows."}
          </p>
          <p className="mt-3 text-sm text-secondary">
            I track it rather than hiding it — part of the discipline. Next step would be prompt or tool-routing
            tweaks so vague skill questions reliably trigger a clarification turn before asserting depth.
          </p>
        </div>
      ) : null}
    </section>
  );
}
