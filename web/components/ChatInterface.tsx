"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ChatTurn } from "@/lib/chat-stream";
import { streamChat } from "@/lib/chat-stream";
import { MessageBubble } from "@/components/MessageBubble";
import { StarterPrompts } from "@/components/StarterPrompts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TypingIndicator } from "@/components/TypingIndicator";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type UiMessage = ChatTurn & { id: string };

export function ChatInterface() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const showStarters = messages.length === 0;

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useLayoutEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      const userMsg: UiMessage = { id: uid(), role: "user", content: trimmed };
      const assistantId = uid();
      const assistantMsg: UiMessage = { id: assistantId, role: "assistant", content: "" };

      const history: ChatTurn[] = [...messages.map(({ role, content }) => ({ role, content })), userMsg];

      setMessages((m) => [...m, userMsg, assistantMsg]);
      setInput("");
      setIsStreaming(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        await streamChat(
          history,
          (delta) => {
            if (!delta) return;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId ? { ...msg, content: msg.content + delta } : msg
              )
            );
          },
          abortRef.current.signal
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong.";
        setError(message);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messages]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface transition-colors duration-300">
      <div className="flex items-start justify-between gap-4 border-b border-border-soft bg-surface/80 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text">Ask about Zach</h2>
          <p className="text-sm text-muted">
            This assistant is based on Zach&apos;s resume and bio—not a live DM. For hiring or anything sensitive,
            reach out by email or LinkedIn anytime.
          </p>
        </div>
        <div className="hidden shrink-0 md:block">
          <ThemeToggle />
        </div>
      </div>

      <div
        ref={messagesScrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {showStarters ? (
            <StarterPrompts disabled={isStreaming} onPick={(t) => void send(t)} />
          ) : null}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={{ role: m.role, content: m.content }} />
          ))}

          {isStreaming && messages.at(-1)?.role === "assistant" && messages.at(-1)?.content === "" ? (
            <TypingIndicator />
          ) : null}

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
        className="border-t border-border-soft bg-surface-alt/80 p-4 backdrop-blur-md md:px-6"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
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
            placeholder="Ask anything about Zach…"
            disabled={isStreaming}
            className="min-h-11 flex-1 resize-none rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-text shadow-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-(--ring) disabled:opacity-60"
          />
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
  );
}
