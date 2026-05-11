"use client";

import { useMemo } from "react";
import { formatUsd } from "@/lib/telemetry-format";
import type { UsageSoFar } from "@/lib/use-streaming-chat";

export type ChatTelemetryPanelProps = {
  lastReplyUsage: UsageSoFar | null;
  inFlightReplyUsage: UsageSoFar | null;
  sessionTotals: UsageSoFar | null;
  /** True while a reply is streaming (card B shows live partial usage). */
  isStreaming: boolean;
  /** Typography: project strip under the card vs compact inside embedded chat. */
  variant?: "below-card" | "inside-chat";
};

/**
 * Two fixed-height summary cards (session + latest reply). No expandable raw logs —
 * those stay in the hook for future use / debugging outside the UI.
 */
export function ChatTelemetryPanel({
  lastReplyUsage,
  inFlightReplyUsage,
  sessionTotals,
  isStreaming,
  variant = "below-card",
}: ChatTelemetryPanelProps) {
  const isBelow = variant === "below-card";

  const sessionSecondary = useMemo(() => {
    if (!sessionTotals) return "Totals appear after each reply.";
    const { outputTokens, estimatedCostUsd } = sessionTotals;
    const out = `${outputTokens.toLocaleString()} out`;
    if (estimatedCostUsd === undefined) return `${out} · est. cost n/a`;
    return `${out} · ~${formatUsd(estimatedCostUsd)}`;
  }, [sessionTotals]);

  const replyDisplay = lastReplyUsage ?? inFlightReplyUsage;

  const replySecondary = useMemo(() => {
    if (!replyDisplay) {
      return isStreaming ? "Waiting for the first usage update from this reply…" : "Send a message to see this reply.";
    }
    const { outputTokens, estimatedCostUsd } = replyDisplay;
    const out = `${outputTokens.toLocaleString()} out`;
    if (estimatedCostUsd === undefined) return `${out} · est. cost n/a`;
    return `${out} · ~${formatUsd(estimatedCostUsd)}`;
  }, [replyDisplay, isStreaming]);

  const titleClass = isBelow
    ? "text-[11px] font-semibold uppercase tracking-widest text-muted md:text-xs"
    : "text-[10px] font-semibold uppercase tracking-widest text-muted";
  const valueClass = isBelow
    ? "mt-1.5 truncate text-2xl font-semibold tabular-nums tracking-tight text-text md:text-3xl"
    : "mt-1 truncate text-xl font-semibold tabular-nums tracking-tight text-text";
  const subClass = isBelow ? "mt-1 text-xs leading-snug text-muted md:text-sm" : "mt-1 text-[11px] leading-snug text-muted";
  const footClass = isBelow ? "mt-2 text-[11px] leading-snug text-muted/90 md:text-xs" : "mt-1.5 text-[10px] leading-snug text-muted/90";

  const cardShell =
    "flex min-h-[6.5rem] min-w-0 flex-col rounded-xl border border-border-soft/70 bg-surface-alt/70 p-3 shadow-sm md:min-h-[7.25rem] md:p-4";

  return (
    <div
      className={`mx-auto w-full max-w-4xl shrink-0 overflow-hidden ${isBelow ? "pb-0.5" : ""}`}
      aria-label="Estimated API usage for this demo"
    >
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <article className={cardShell}>
          <h3 className={titleClass}>Session total</h3>
          {sessionTotals ? (
            <p className={valueClass} title={`${sessionTotals.inputTokens} tokens in`}>
              {sessionTotals.inputTokens.toLocaleString()}
              <span className="ml-1.5 text-base font-medium text-muted md:text-lg">tokens in</span>
            </p>
          ) : (
            <p className={valueClass}>—</p>
          )}
          <p className={`${subClass} line-clamp-2`}>{sessionSecondary}</p>
          <p className={`${footClass} mt-auto`}>
            Cumulative for this chat · clears when you tap Clear
          </p>
        </article>

        <article className={cardShell}>
          <h3 className={titleClass}>
            Latest reply
            {isStreaming ? (
              <span
                className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary align-middle"
                aria-label="Streaming"
              />
            ) : null}
          </h3>
          {replyDisplay ? (
            <p className={valueClass} title={`${replyDisplay.inputTokens} tokens in`}>
              {replyDisplay.inputTokens.toLocaleString()}
              <span className="ml-1.5 text-base font-medium text-muted md:text-lg">tokens in</span>
            </p>
          ) : (
            <p className={valueClass}>—</p>
          )}
          <p className={`${subClass} line-clamp-2`}>
            {isStreaming && replyDisplay ? <span className="text-primary/90">Live · </span> : null}
            {replySecondary}
          </p>
          <p className={`${footClass} mt-auto`}>One assistant response · resets on your next send</p>
        </article>
      </div>

      {isBelow ? (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted md:mt-4 md:text-xs">
          Rough estimates from published token rates — not billing. Input includes prompt cache where applicable.
        </p>
      ) : (
        <p className="mt-2 text-center text-[10px] leading-relaxed text-muted">
          Rough estimates — not billing.
        </p>
      )}
    </div>
  );
}
