export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-1 py-2 text-primary"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <span className="sr-only">Typing</span>
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.32s]" />
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.16s]" />
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-current" />
    </div>
  );
}
