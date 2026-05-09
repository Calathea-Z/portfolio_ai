import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ChatTurn } from "@/lib/chat-stream";
import { streamChat } from "@/lib/chat-stream";
import type { UiMessage } from "@/lib/chat-history-storage";
import { uid } from "@/lib/chat-history-storage";

type SetMessages = Dispatch<SetStateAction<UiMessage[]>>;

/**
 * Handles POST/stream lifecycle: optimistic UI, deltas into the assistant bubble,
 * abort wiring, and error recovery (drops empty assistant stub on failure).
 */
export function useChatSend(messages: UiMessage[], setMessages: SetMessages) {
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

      const history: ChatTurn[] = [...messages.map(({ role, content }) => ({ role, content })), userMsg];

      setMessages((m) => [...m, userMsg, assistantMsg]);
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
    [isStreaming, messages, setMessages]
  );

  return { send, isStreaming, error, setError };
}
