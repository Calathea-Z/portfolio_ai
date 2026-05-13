import type { ReactNode } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";

/**
 * Empty-state intro for the chat transcript. Intentionally no resume / email /
 * social buttons — those live in the site nav, hero, and Contact section so
 * this block stays focused on how the agentic chat works.
 */
export function ChatEmptyHero() {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border-soft bg-surface-alt p-3 duration-300 sm:p-4">
      <h3 className="text-base font-semibold leading-snug tracking-tight text-text sm:text-lg md:text-xl">
        I&apos;m Zach—full-stack engineer on React, TypeScript, and .NET backends (Azure at my day job; happy to grow into whatever stack you run).
      </h3>

      {/* Short line on phones; fuller explanation from sm up */}
      <p className="mt-2 text-sm text-muted md:hidden">
        Ask about my work. The assistant calls resume-backed tools and shows each call in the thread.
      </p>
      <p className="mt-2 hidden text-sm text-muted md:block">
        Ask about a role, project, skill, or metric. The model calls structured tools against my resume
        before answering, and you can expand each call to see the inputs and JSON returned.
      </p>

      {/* Tool names: collapsed on small screens to cut visual noise */}
      <details className="group mt-3 rounded-xl border border-border-soft bg-surface md:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium text-text [&::-webkit-details-marker]:hidden">
          <CaretRightIcon
            className="shrink-0 text-muted transition-transform group-open:rotate-90"
            size={16}
            weight="bold"
            aria-hidden
          />
          <span>Which resume tools run?</span>
          <span className="ml-auto font-mono text-[10px] text-muted">7 tools</span>
        </summary>
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

      <div className="mt-3 hidden flex-wrap gap-2 md:mt-4 md:flex">
        <ToolPill>get_role</ToolPill>
        <ToolPill>search_resume</ToolPill>
        <ToolPill>list_projects_by_skill</ToolPill>
        <ToolPill>get_metrics</ToolPill>
        <ToolPill>list_recent_shipped</ToolPill>
        <ToolPill>get_narrative</ToolPill>
        <ToolPill>get_faq</ToolPill>
      </div>
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
