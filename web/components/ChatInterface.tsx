"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ChatTurn } from "@/lib/chat-stream";
import { streamChat } from "@/lib/chat-stream";
import { MessageBubble } from "@/components/MessageBubble";
import { StarterPrompts } from "@/components/StarterPrompts";
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 md:px-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Ask the portfolio</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          I answer from my real background—kitchens to code, DITA pipelines, and what I want next.
        </p>
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
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 md:px-6"
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
            className="min-h-11 flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-emerald-700/30 placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="self-end rounded-xl bg-emerald-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
