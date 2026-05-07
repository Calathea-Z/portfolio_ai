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

  const clearChat = () => {
    if (isStreaming) return;
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent transition-colors duration-300">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-5">
        <div className="shrink-0 rounded-2xl border border-border-soft/70 bg-surface/85 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-text">Ask about Zach</h2>
              <p className="text-sm text-muted">
                Ask about shipped projects, architecture decisions, leadership style, and role fit.
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <span className="rounded-full border border-border-soft bg-surface-alt px-3 py-1 text-xs font-medium text-text">
                Open to remote full-stack roles
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div
          ref={messagesScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-border-soft/70 bg-surface/70 p-3 shadow-sm backdrop-blur-md md:p-5"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {showStarters ? (
              <section className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border-soft/80 bg-surface-alt/80 p-4 duration-300">
                <h3 className="text-xl font-semibold tracking-tight text-text">
                  Hi, I&apos;m Zach - full-stack engineer shipping React/.NET on Azure.
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Grounded in Zach&apos;s resume and project context. I build production full-stack systems with clear
                  ownership from UI to cloud.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="/resume"
                    className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] transition-all hover:bg-primary-hover"
                  >
                    View Resume
                  </a>
                  <a
                    href="mailto:hello@zach.dev"
                    className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm font-medium text-text transition-all hover:border-primary/60 hover:bg-surface-alt"
                  >
                    Email Zach
                  </a>
                  <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm font-medium text-text transition-all hover:border-primary/60 hover:bg-surface-alt"
                  >
                    LinkedIn
                  </a>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-xs text-muted">
                    3+ years professional engineering
                  </span>
                  <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-xs text-muted">
                    Next.js + .NET 8 + Azure
                  </span>
                  <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-xs text-muted">
                    Remote-first collaborator
                  </span>
                </div>
              </section>
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

        <form onSubmit={onSubmit} className="shrink-0 rounded-2xl border border-border-soft/70 bg-surface/85 p-4 shadow-sm backdrop-blur-md">
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
