"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  const label = "Toggle color theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-soft bg-surface text-text shadow-sm transition-all duration-300 hover:bg-surface-alt hover:shadow-md focus:outline-none focus:ring-2 focus:ring-(--ring) ${className ?? ""}`.trim()}
    >
      <span className="sr-only">{label}</span>
      <SunIcon className="hidden h-4 w-4 dark:block" aria-hidden />
      <MoonIcon className="h-4 w-4 dark:hidden" aria-hidden />
    </button>
  );
}
