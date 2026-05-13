import { ChatInterface } from "@/components/ChatInterface";
import { sectionIds } from "@/lib/site-config";

export function ChatSection() {
  return (
    <section
      id={sectionIds.chat}
      aria-labelledby="chat-heading"
      className="scroll-mt-24 border-t border-border-subtle"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Chat
        </p>
        <h2
          id="chat-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          Resume-backed chat
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          Answers come from structured resume data and tools—not me typing live. Try a specific role,
          a technology I&apos;ve used, or what I&apos;m looking for next.
        </p>

        {/* Tall embed: more room for empty state + thread; inner "Ask about Zach" header hidden when embedded. */}
        <div className="mt-8 flex h-[min(88dvh,860px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-sm md:h-[720px] md:min-h-0">
          <ChatInterface embedded />
        </div>
      </div>
    </section>
  );
}
