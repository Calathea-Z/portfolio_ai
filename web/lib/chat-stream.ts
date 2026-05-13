import axios from "axios";
import { apiClient } from "@/lib/api-client";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatEvent =
  | { kind: "text"; text: string }
  | { kind: "tool_call_start"; id: string; name: string }
  | { kind: "tool_input_delta"; id: string; fragment: string }
  | { kind: "tool_call"; id: string; name: string; input: unknown }
  | { kind: "tool_result"; id: string; output: unknown; error?: string }
  | {
      kind: "usage";
      round: number;
      inputTokens?: number;
      outputTokens?: number;
      cacheCreationInputTokens?: number;
      cacheReadInputTokens?: number;
      estimatedCostUsd?: number;
    }
  | {
      kind: "usage_total";
      inputTokens: number;
      outputTokens: number;
      estimatedCostUsd?: number;
    }
  | {
      kind: "trace_span";
      name: string;
      round: number;
      durationMs: number;
      attributes?: unknown;
    }
  | { kind: "done" }
  | { kind: "error"; message: string };

export type StreamChatOptions = {
  /** API endpoint relative to the chat API base URL (e.g. "/chat"). */
  endpoint: string;
  /** Conversation history to send. */
  messages: ChatTurn[];
  /** Called once for every decoded NDJSON event as it arrives. */
  onEvent: (event: ChatEvent) => void;
  /** Optional abort signal — cancel the request mid-stream. */
  signal?: AbortSignal;
  /** Optional extra headers (e.g. <c>X-Chat-Trace</c> for debug telemetry). */
  headers?: Record<string, string>;
};

/**
 * POSTs messages to a streaming chat endpoint and forwards parsed NDJSON
 * <see cref="ChatEvent"/> records to <c>onEvent</c>. The server emits one
 * JSON object per line; this reader buffers across chunk boundaries.
 */
export async function streamChat({
  endpoint,
  messages,
  onEvent,
  signal,
  headers,
}: StreamChatOptions): Promise<void> {
  try {
    const response = await apiClient.post<ReadableStream<Uint8Array>>(
      endpoint,
      { messages },
      {
        responseType: "stream",
        signal,
        ...(headers ? { headers } : {}),
      }
    );

    const stream = response.data;
    if (!stream || typeof stream.getReader !== "function") {
      throw new Error("No response body to read.");
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const flushLine = (raw: string) => {
      const line = raw.trim();
      if (!line) return;
      try {
        const event = JSON.parse(line) as ChatEvent;
        if (event && typeof event === "object" && typeof (event as ChatEvent).kind === "string") {
          onEvent(event);
        }
      } catch {
        // Skip malformed lines (defensive — server emits well-formed JSON).
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        if (buffer) flushLine(buffer);
        break;
      }
      if (!value) continue;

      buffer += decoder.decode(value, { stream: true });
      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        flushLine(line);
      }
    }
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const res = e.response;
      let detail = e.message;
      const data = res?.data;

      if (data && typeof data === "object" && data !== null && "error" in data) {
        detail = String((data as { error?: string }).error);
      } else if (typeof data === "string" && data.trim()) {
        detail = data;
      }

      throw new Error(detail || `Request failed (${res?.status ?? "?"})`);
    }
    throw e;
  }
}
