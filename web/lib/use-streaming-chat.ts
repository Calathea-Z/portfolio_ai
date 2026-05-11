import { useCallback, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { streamChat, type ChatEvent, type ChatTurn } from "@/lib/chat-stream";
import {
  makeAssistantPlaceholder,
  makeUserMessage,
  messageText,
  type MessageChunk,
  type UiMessage,
} from "@/lib/chat-history-storage";

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
 * Drives the POST/stream lifecycle for the agentic chat UI:
 * - optimistic insertion of the user + empty assistant message
 * - dispatches each NDJSON <see cref="ChatEvent"/> into the assistant's chunk array
 * - aborts the previous request on consecutive sends
 * - error recovery (drops the empty assistant message on failure)
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
      const userMsg = makeUserMessage(trimmed);
      const assistantMsg = makeAssistantPlaceholder();

      // Server is stateless: send the flat text history. The tool loop reruns each turn.
      const history: ChatTurn[] = [
        ...messages.map((m) => ({ role: m.role, content: messageText(m) })),
        { role: userMsg.role, content: messageText(userMsg) },
      ];

      setMessages((m) => [...m, userMsg, assistantMsg]);
      setIsStreaming(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        await streamChat({
          endpoint,
          messages: history,
          signal: abortRef.current.signal,
          onEvent: (event) => applyEvent(setMessages, assistantMsg.id, event, setError),
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong.";
        setError(message);
        // Drop the assistant placeholder if it never received content.
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMsg.id || m.chunks.length > 0)
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [endpoint, isStreaming, messages, setMessages]
  );

  return { send, isStreaming, error, setError };
}

/** Apply a single ChatEvent to the in-flight assistant message. */
function applyEvent(
  setMessages: SetMessages,
  assistantId: string,
  event: ChatEvent,
  setError: Dispatch<SetStateAction<string | null>>
) {
  if (event.kind === "done") return;

  if (event.kind === "error") {
    setError(event.message);
    return;
  }

  setMessages((prev) =>
    prev.map((msg) => (msg.id === assistantId ? { ...msg, chunks: reduceChunks(msg.chunks, event) } : msg))
  );
}

function reduceChunks(chunks: MessageChunk[], event: ChatEvent): MessageChunk[] {
  switch (event.kind) {
    case "text": {
      const last = chunks.at(-1);
      if (last?.kind === "text") {
        return [
          ...chunks.slice(0, -1),
          { ...last, text: last.text + event.text },
        ];
      }
      return [...chunks, { kind: "text", text: event.text }];
    }
    case "tool_call":
      return [
        ...chunks,
        { kind: "tool_call", id: event.id, name: event.name, input: event.input },
      ];
    case "tool_result":
      return chunks.map((chunk) =>
        chunk.kind === "tool_call" && chunk.id === event.id
          ? { ...chunk, result: event.output, error: event.error }
          : chunk
      );
    default:
      return chunks;
  }
}
