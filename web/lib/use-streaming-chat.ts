import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { streamChat, type ChatTurn } from "@/lib/chat-stream";
import { uid, type UiMessage } from "@/lib/chat-history-storage";

type SetMessages = Dispatch<SetStateAction<UiMessage[]>>;

export type UseStreamingChatOptions = {
  /** API endpoint to POST to (defaults to "/chat"). */
  endpoint?: string;
  /** Current message history. */
  messages: UiMessage[];
  /** Setter for the message history. */
  setMessages: SetMessages;
};

/**
 * Drives the POST/stream lifecycle for a chat-style UI:
 * - optimistic insertion of the user + empty assistant bubble
 * - delta accumulation into the assistant bubble
 * - abort wiring on consecutive sends
 * - error recovery (drops the empty assistant bubble on failure)
 *
 * Generic over endpoint so future project demos (e.g. /projects/pr-review)
 * can call the same hook with their own URL.
 */
export function useStreamingChat({
  endpoint = "/chat",
  messages,
  setMessages,
}: UseStreamingChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      const userMsg: UiMessage = { id: uid(), role: "user", content: trimmed };
      const assistantId = uid();
      const assistantMsg: UiMessage = { id: assistantId, role: "assistant", content: "" };

      const history: ChatTurn[] = [
        ...messages.map(({ role, content }) => ({ role, content })),
        userMsg,
      ];

      setMessages((m) => [...m, userMsg, assistantMsg]);
      setIsStreaming(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        await streamChat({
          endpoint,
          messages: history,
          onDelta: (delta) => {
            if (!delta) return;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId ? { ...msg, content: msg.content + delta } : msg
              )
            );
          },
          signal: abortRef.current.signal,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong.";
        setError(message);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [endpoint, isStreaming, messages, setMessages]
  );

  return { send, isStreaming, error, setError };
}
