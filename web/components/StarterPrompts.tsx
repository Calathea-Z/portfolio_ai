type Props = {
  onPick: (text: string) => void;
  disabled?: boolean;
};

const PROMPTS = [
  "Summarize your background and current role.",
  "What have you shipped recently at work?",
  "Tell me about your freelance work at Calathea.",
  "How does kitchen management relate to how you engineer?",
  "What kind of role are you looking for next?",
];

export function StarterPrompts({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted">Try asking</p>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((text) => (
          <button
            key={text}
            type="button"
            disabled={disabled}
            onClick={() => onPick(text)}
            className="rounded-full border border-border-soft bg-surface px-3 py-1.5 text-left text-sm text-text shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-alt hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
