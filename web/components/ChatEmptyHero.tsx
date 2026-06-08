import type { ReactNode } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";

/**
 * Empty-state intro for the chat transcript.
 */
export function ChatEmptyHero() {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border-soft bg-surface-alt p-3 duration-300 sm:p-4">
      <p className="text-sm text-muted">
        Ask about my experience, projects, or what kind of role I&apos;m looking for next. Answers
        are grounded in structured resume data — not live typing.
      </p>

      <details className="group mt-3 rounded-xl border border-border-soft bg-surface">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
          <CaretRightIcon
            className="shrink-0 text-muted transition-transform group-open:rotate-90"
            size={16}
            weight="bold"
            aria-hidden
          />
          <span>How it works under the hood</span>
          <span className="ml-auto font-mono text-[10px] text-muted">7 tools</span>
        </summary>
        <p className="border-t border-border-subtle px-3 pb-2 pt-2 text-xs text-muted">
          The model calls structured resume tools before answering. Expand any tool call in the
          thread to see inputs and JSON returned.
        </p>
        <div className="flex flex-wrap gap-1.5 border-t border-border-subtle bg-surface-well px-3 pb-3 pt-2">
          <ToolPill>get_role</ToolPill>
          <ToolPill>search_resume</ToolPill>
          <ToolPill>list_projects_by_skill</ToolPill>
          <ToolPill>get_metrics</ToolPill>
          <ToolPill>list_recent_shipped</ToolPill>
          <ToolPill>get_narrative</ToolPill>
          <ToolPill>get_faq</ToolPill>
        </div>
      </details>
    </section>
  );
}

function ToolPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border-subtle bg-code-bg px-2.5 py-0.5 font-mono text-[10px] text-code-fg sm:px-3 sm:py-1 sm:text-[11px]">
      {children}
    </span>
  );
}
