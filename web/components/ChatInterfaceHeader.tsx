import { ThemeToggle } from "@/components/ThemeToggle";

export function ChatInterfaceHeader() {
  return (
    <div className="shrink-0 rounded-2xl border border-border-soft bg-surface-raised p-3 shadow-sm backdrop-blur-md sm:p-4">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text sm:text-lg">Ask about Zach</h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            <span className="md:hidden">Shipped work, stack, and role fit.</span>
            <span className="hidden md:inline">
              Ask about shipped projects, architecture decisions, leadership style, and role fit.
            </span>
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
