"use client";

import { CaretDownIcon, MagnifyingGlassIcon, WarningIcon } from "@phosphor-icons/react";
import { useState } from "react";

type ToolCallPillProps = {
  name: string;
  input: unknown;
  /** Streaming partial JSON before the final <c>input</c> object is available. */
  inputPreview?: string;
  result?: unknown;
  error?: string;
};

/**
 * Inline pill that surfaces an agentic tool call in the assistant transcript.
 * Collapsed by default; expands to show the raw input and output JSON.
 */
export function ToolCallPill({ name, input, inputPreview, result, error }: ToolCallPillProps) {
  const [open, setOpen] = useState(false);
  const status: ToolStatus = error ? "error" : result === undefined ? "pending" : "done";

  return (
    <div className="my-2 inline-block max-w-full align-top">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group inline-flex max-w-full items-center gap-2 rounded-full border border-border-soft/70 bg-surface-alt/80 px-3 py-1 text-xs text-text shadow-sm transition-all hover:border-primary/60 hover:bg-surface-alt"
      >
        <StatusIndicator status={status} />
        <span className="font-mono text-[12px] text-primary">{name}</span>
        <span className="truncate font-mono text-[12px] text-muted">
          ({summarizeToolArgs(input, inputPreview, result, error)})
        </span>
        <CaretDownIcon
          size={12}
          weight="bold"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="mt-2 space-y-2 rounded-xl border border-border-soft/70 bg-surface/80 p-3 text-xs">
          <DetailRow
            label="Input"
            json={input}
            raw={
              inputPreview && result === undefined && !error
                ? `${inputPreview}…`
                : undefined
            }
          />
          {status === "error" ? (
            <DetailRow label="Error" raw={error ?? "Unknown error"} tone="error" />
          ) : (
            <DetailRow label="Output" json={result} placeholder="Awaiting result..." />
          )}
        </div>
      ) : null}
    </div>
  );
}

type ToolStatus = "pending" | "done" | "error";

function StatusIndicator({ status }: { status: ToolStatus }) {
  if (status === "pending") {
    return (
      <span
        aria-label="Running"
        className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary"
      />
    );
  }
  if (status === "error") {
    return <WarningIcon size={12} weight="fill" className="shrink-0 text-amber-500" aria-label="Error" />;
  }
  return (
    <MagnifyingGlassIcon size={12} weight="bold" className="shrink-0 text-primary" aria-label="Done" />
  );
}

function DetailRow({
  label,
  json,
  raw,
  tone,
  placeholder,
}: {
  label: string;
  json?: unknown;
  raw?: string;
  tone?: "error";
  placeholder?: string;
}) {
  const body = raw ?? (json === undefined ? placeholder ?? "" : safeStringify(json));
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <pre
        className={`overflow-x-auto rounded-lg border px-2 py-1 font-mono text-[11px] leading-snug whitespace-pre-wrap ${
          tone === "error"
            ? "border-amber-400/40 bg-amber-50/60 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200"
            : "border-border-soft/60 bg-surface-alt text-text/90"
        }`}
      >
        {body}
      </pre>
    </div>
  );
}

const MAX_SUMMARY_LENGTH = 56;

function summarizeToolArgs(
  input: unknown,
  inputPreview: string | undefined,
  result: unknown,
  error: string | undefined
): string {
  if (result === undefined && !error && inputPreview) {
    const frag = inputPreview.length > MAX_SUMMARY_LENGTH - 2 ? `${inputPreview.slice(0, MAX_SUMMARY_LENGTH - 2)}…` : inputPreview;
    return `${frag}…`;
  }
  return summarizeInput(input);
}

function summarizeInput(input: unknown): string {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "";
  const entries = Object.entries(input as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";

  const parts = entries.map(([k, v]) => `${k}=${formatValue(v)}`);
  const joined = parts.join(", ");
  return joined.length > MAX_SUMMARY_LENGTH ? `${joined.slice(0, MAX_SUMMARY_LENGTH - 1)}…` : joined;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "…";
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
