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

export type ChatDebugEntry =
  | { kind: "usage"; json: string }
  | { kind: "usage_total"; json: string }
  | { kind: "trace_span"; json: string };

export type UsageSoFar = {
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd?: number;
};

export type TraceSpanUi = {
  name: string;
  round: number;
  durationMs: number;
  attributes?: unknown;
};

export type UseStreamingChatOptions = {
  /** API endpoint to POST to (defaults to "/chat"). */
  endpoint?: string;
  /** Current message history. */
  messages: UiMessage[];
  /** Setter for the message history. */
  setMessages: SetMessages;
  /** Optional extra headers on the streaming POST (debug / trace flags). */
  streamHeaders?: Record<string, string>;
};

/**
 * Drives the POST/stream lifecycle for the agentic chat UI:
 * - optimistic insertion of the user + empty assistant message
 * - dispatches each NDJSON <see cref="ChatEvent"/> into the assistant's chunk array
 * - aborts the previous request on consecutive sends
 * - error recovery (drops the empty assistant message on failure)
 *
 * `send` resolves to `true` when the stream finished without a thrown error and without an
 * NDJSON `error` event (so the UI can clear the input); otherwise `false`.
 */
export function useStreamingChat({
  endpoint = "/chat",
  messages,
  setMessages,
  streamHeaders,
}: UseStreamingChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugFeed, setDebugFeed] = useState<ChatDebugEntry[]>([]);
  /** Latest completed reply (one HTTP request); reset each send. Surfaced in summary UI. */
  const [lastReplyUsage, setLastReplyUsage] = useState<UsageSoFar | null>(null);
  /** Running totals for the current in-flight reply (multi-round); overwritten by final usage_total. */
  const [inFlightReplyUsage, setInFlightReplyUsage] = useState<UsageSoFar | null>(null);
  const [traceSpans, setTraceSpans] = useState<TraceSpanUi[]>([]);
  /** Cumulative totals across successful replies in this session (until reset). */
  const [sessionTotals, setSessionTotals] = useState<UsageSoFar | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const resetSessionTelemetry = useCallback(() => {
    setSessionTotals(null);
    setLastReplyUsage(null);
    setInFlightReplyUsage(null);
    setDebugFeed([]);
    setTraceSpans([]);
  }, []);

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return false;

      let sawNdjsonError = false;

      setError(null);
      setDebugFeed([]);
      setLastReplyUsage(null);
      setInFlightReplyUsage(null);
      setTraceSpans([]);
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
          headers: streamHeaders,
          onEvent: (event) => {
            if (event.kind === "error") sawNdjsonError = true;
            if (event.kind === "usage") {
              setDebugFeed((prev) => [...prev, { kind: "usage", json: JSON.stringify(event, null, 2) }]);
              const billedInputTokens =
                (event.inputTokens ?? 0) + (event.cacheCreationInputTokens ?? 0) + (event.cacheReadInputTokens ?? 0);
              const billedOutputTokens = event.outputTokens ?? 0;
              setInFlightReplyUsage((prev) => {
                const next = {
                  inputTokens: (prev?.inputTokens ?? 0) + billedInputTokens,
                  outputTokens: (prev?.outputTokens ?? 0) + billedOutputTokens,
                };
                if (event.estimatedCostUsd !== undefined) {
                  return {
                    ...next,
                    estimatedCostUsd: (prev?.estimatedCostUsd ?? 0) + event.estimatedCostUsd,
                  };
                }
                return { ...next, estimatedCostUsd: prev?.estimatedCostUsd };
              });
              return;
            }
            if (event.kind === "usage_total") {
              setDebugFeed((prev) => [...prev, { kind: "usage_total", json: JSON.stringify(event, null, 2) }]);
              const finalReply: UsageSoFar = {
                inputTokens: event.inputTokens,
                outputTokens: event.outputTokens,
                estimatedCostUsd: event.estimatedCostUsd,
              };
              setLastReplyUsage(finalReply);
              setInFlightReplyUsage(null);
              setSessionTotals((prev) => {
                const nextInput = (prev?.inputTokens ?? 0) + event.inputTokens;
                const nextOutput = (prev?.outputTokens ?? 0) + event.outputTokens;
                if (event.estimatedCostUsd === undefined) {
                  return prev === null
                    ? { inputTokens: nextInput, outputTokens: nextOutput }
                    : {
                        inputTokens: nextInput,
                        outputTokens: nextOutput,
                        estimatedCostUsd: prev.estimatedCostUsd,
                      };
                }
                const nextCost = (prev?.estimatedCostUsd ?? 0) + event.estimatedCostUsd;
                return {
                  inputTokens: nextInput,
                  outputTokens: nextOutput,
                  estimatedCostUsd: nextCost,
                };
              });
              return;
            }
            if (event.kind === "trace_span") {
              setDebugFeed((prev) => [...prev, { kind: "trace_span", json: JSON.stringify(event, null, 2) }]);
              setTraceSpans((prev) => {
                const MAX_TRACE_SPANS = 80;
                const next = [...prev, event];
                return next.length > MAX_TRACE_SPANS ? next.slice(next.length - MAX_TRACE_SPANS) : next;
              });
              return;
            }
            applyEvent(setMessages, assistantMsg.id, event, setError);
          },
        });
        return !sawNdjsonError;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong.";
        setError(message);
        // Drop the assistant placeholder if it never received content.
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMsg.id || m.chunks.length > 0)
        );
        return false;
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [endpoint, isStreaming, messages, setMessages, streamHeaders]
  );

  return {
    send,
    isStreaming,
    error,
    setError,
    debugFeed,
    lastReplyUsage,
    inFlightReplyUsage,
    sessionTotals,
    traceSpans,
    resetSessionTelemetry,
  };
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
    case "tool_call_start":
      return [
        ...chunks,
        {
          kind: "tool_call",
          id: event.id,
          name: event.name,
          input: {},
          inputPreview: "",
        },
      ];
    case "tool_input_delta":
      return chunks.map((chunk) =>
        chunk.kind === "tool_call" && chunk.id === event.id
          ? { ...chunk, inputPreview: (chunk.inputPreview ?? "") + event.fragment }
          : chunk
      );
    case "tool_call": {
      const idx = chunks.findIndex((c) => c.kind === "tool_call" && c.id === event.id);
      if (idx === -1) {
        return [
          ...chunks,
          { kind: "tool_call", id: event.id, name: event.name, input: event.input },
        ];
      }
      const cur = chunks[idx] as Extract<MessageChunk, { kind: "tool_call" }>;
      return [
        ...chunks.slice(0, idx),
        {
          kind: "tool_call",
          id: cur.id,
          name: event.name,
          input: event.input,
          result: cur.result,
          error: cur.error,
        },
        ...chunks.slice(idx + 1),
      ];
    }
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
