"use client";

import { useState, type SubmitEvent } from "react";
import { MessageBubble } from "@/components/MessageBubble";
import { StarterPrompts } from "@/components/StarterPrompts";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatEmptyHero } from "@/components/ChatEmptyHero";
import { ChatInterfaceHeader } from "@/components/ChatInterfaceHeader";
import { useLockDocumentOverflow } from "@/hooks/useLockDocumentOverflow";
import { usePersistedChatMessages } from "@/hooks/usePersistedChatMessages";
import { useStickToBottom } from "@/hooks/useStickToBottom";
import { useStreamingChat } from "@/lib/use-streaming-chat";

export type { UiMessage } from "@/lib/chat-history-storage";

type ChatInterfaceProps = {
  /**
   * When true, render as a self-contained block (no document overflow lock)
   * suitable for embedding inside the homepage scroll layout. Caller controls
   * the outer height — the component fills it.
   */
  embedded?: boolean;
};

export function ChatInterface({ embedded = false }: ChatInterfaceProps = {}) {
  const { messages, setMessages } = usePersistedChatMessages();
  const [input, setInput] = useState("");
  const { send, isStreaming, error, setError } = useStreamingChat({ messages, setMessages });

  useLockDocumentOverflow(!embedded);
  const messagesScrollRef = useStickToBottom(messages, isStreaming);

  const showStarters = messages.length === 0;
  const showTyping =
    isStreaming &&
    messages.at(-1)?.role === "assistant" &&
    messages.at(-1)?.content === "";

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    void send(input);
  };

  const clearChat = () => {
    if (isStreaming) return;
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent transition-colors duration-300">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-5">
        <ChatInterfaceHeader />

        <div
          ref={messagesScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-border-soft/70 bg-surface/70 p-3 shadow-sm backdrop-blur-md md:p-5"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {showStarters ? (
              <ChatEmptyHero />
            ) : (
              <div className="rounded-xl border border-border-soft/70 bg-surface-alt/70 px-3 py-2 text-xs text-muted">
                Resume-grounded assistant
              </div>
            )}

            {showStarters ? (
              <StarterPrompts disabled={isStreaming} onPick={(t) => void send(t)} />
            ) : null}

            {messages.map((m) => (
              <div key={m.id} className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                <MessageBubble message={{ role: m.role, content: m.content }} />
              </div>
            ))}

            {showTyping ? <TypingIndicator /> : null}

            {error ? (
              <p
                className="rounded-lg border border-red-300/60 bg-red-50/80 px-3 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="shrink-0 rounded-2xl border border-border-soft/70 bg-surface/85 p-4 shadow-sm backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-4xl gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <textarea
              id="chat-input"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask anything about Zach..."
              disabled={isStreaming}
              className="min-h-11 flex-1 resize-none rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-text shadow-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-(--ring) disabled:opacity-60"
            />
            <button
              type="button"
              onClick={clearChat}
              disabled={isStreaming || messages.length === 0}
              className="self-end rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm font-medium text-text transition-all hover:border-primary/60 hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="self-end rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] transition-all hover:bg-primary-hover hover:shadow-[0_6px_20px_rgb(124_92_255/0.35)] disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-[0_4px_14px_rgb(184_165_255/0.25)] dark:hover:shadow-[0_6px_20px_rgb(184_165_255/0.35)]"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
