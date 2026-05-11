import { ChatInterface } from "@/components/ChatInterface";
import { sectionIds } from "@/lib/site-config";

export function ChatSection() {
  return (
    <section
      id={sectionIds.chat}
      aria-labelledby="chat-heading"
      className="scroll-mt-24 border-t border-border-soft/70"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Chat
        </p>
        <h2
          id="chat-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          Ask my AI agent about my work.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          It&apos;s grounded in my resume — try asking about a specific role,
          which technologies I&apos;ve shipped, or what I&apos;m looking for next.
        </p>

        <div className="mt-8 flex h-[640px] flex-col overflow-hidden rounded-2xl border border-border-soft/70 bg-surface/50 shadow-sm">
          <ChatInterface embedded />
        </div>
      </div>
    </section>
  );
}
