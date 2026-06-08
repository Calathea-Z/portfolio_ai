import { ChatInterface } from "@/components/ChatInterface";
import { sectionIds } from "@/lib/site-config";

export function ChatSection() {
  return (
    <section
      id={sectionIds.chat}
      aria-labelledby="chat-heading"
      className="scroll-mt-24 border-t border-border-subtle"
    >
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Chat Demo
        </p>
        <h2
          id="chat-heading"
          className="mt-2 text-xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          Portfolio assistant — production AI integration
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:mt-3 sm:text-base">
          I build production software; this assistant is one example — a streaming chat backed by a
          real ASP.NET Core API, structured data, and guardrails. Ask about my work, stack, or role
          fit.
        </p>

        {/* Tall embed: more room for empty state + thread; inner "Ask about Zach" header hidden when embedded. */}
        <div className="mt-6 flex h-[min(72dvh,520px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-sm sm:mt-8 md:h-[720px] md:min-h-0">
          <ChatInterface embedded />
        </div>
      </div>
    </section>
  );
}
