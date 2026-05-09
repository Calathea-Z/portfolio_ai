import { ThemeToggle } from "@/components/ThemeToggle";

export function ChatInterfaceHeader() {
  return (
    <div className="shrink-0 rounded-2xl border border-border-soft/70 bg-surface/85 p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text">Ask about Zach</h2>
          <p className="text-sm text-muted">
            Ask about shipped projects, architecture decisions, leadership style, and role fit.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <span className="rounded-full border border-border-soft bg-surface-alt px-3 py-1 text-xs font-medium text-text">
            Open to remote full-stack roles
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
