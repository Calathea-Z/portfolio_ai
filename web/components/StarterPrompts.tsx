type Props = {
  onPick: (text: string) => void;
  disabled?: boolean;
};

const PROMPTS = [
  "Who are you and how did you get into software?",
  "What are you working on lately?",
  "Walk me through a hard technical problem you solved.",
  "What stack do you prefer and why?",
  "What kind of team or role are you looking for?",
];

export function StarterPrompts({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Try asking</p>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((text) => (
          <button
            key={text}
            type="button"
            disabled={disabled}
            onClick={() => onPick(text)}
            className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-left text-sm text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
