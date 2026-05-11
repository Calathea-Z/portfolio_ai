import {
  BriefcaseIcon,
  ChartLineUpIcon,
  RocketIcon,
  WrenchIcon,
  type Icon,
} from "@phosphor-icons/react";

type Props = {
  onPick: (text: string) => void;
  disabled?: boolean;
};

type Prompt = {
  icon: Icon;
  text: string;
  hint: string;
};

const PROMPTS: Prompt[] = [
  { icon: RocketIcon,      text: "What did you ship in 2025?",                 hint: "get_role + list_recent_shipped" },
  { icon: WrenchIcon,      text: "Which projects used .NET?",                   hint: "list_projects_by_skill" },
  { icon: ChartLineUpIcon, text: "What metrics back your experience claims?",   hint: "get_metrics" },
  { icon: BriefcaseIcon,   text: "Tell me about your role at Forvis Mazars.",   hint: "get_role" },
];

export function StarterPrompts({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <p className="text-sm font-medium text-muted md:hidden">Starter prompts — tap to send.</p>
      <p className="hidden text-sm font-medium text-muted md:block">
        Try one of these — each one fires a structured tool call so you can see how it works.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PROMPTS.map(({ icon: IconComponent, text, hint }) => (
          <button
            key={text}
            type="button"
            disabled={disabled}
            onClick={() => onPick(text)}
            className="group flex items-start gap-2.5 rounded-xl border border-border-soft bg-surface p-2.5 text-left text-sm text-text shadow-sm transition-all hover:border-primary/40 hover:bg-surface-alt hover:shadow-md sm:gap-3 sm:p-3 sm:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <IconComponent size={16} weight="bold" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
              <span className="leading-snug">{text}</span>
              <span className="hidden font-mono text-[10px] tracking-tight text-muted md:block">
                {hint}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
