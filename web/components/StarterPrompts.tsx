type Props = {
  onPick: (text: string) => void;
  disabled?: boolean;
};

const PROMPTS = [
  { icon: "🚀", text: "What have you shipped recently at work?" },
  { icon: "🌿", text: "Tell me about your freelance work at Calathea." },
  { icon: "🧭", text: "How does kitchen leadership shape your engineering?" },
  { icon: "🎯", text: "What role are you targeting next?" },
];

export function StarterPrompts({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted">Try one of these quick prompts</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PROMPTS.map((item) => (
          <button
            key={item.text}
            type="button"
            disabled={disabled}
            onClick={() => onPick(item.text)}
            className="rounded-xl border border-border-soft bg-surface p-3 text-left text-sm text-text shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-alt hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <span className="mb-1 block text-base leading-none">{item.icon}</span>
            <span className="leading-relaxed">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
