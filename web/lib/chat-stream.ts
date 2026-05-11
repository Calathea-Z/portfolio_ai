import axios from "axios";
import { apiClient } from "@/lib/api-client";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type StreamChatOptions = {
  /** API endpoint relative to the chat API base URL (e.g. "/chat" or "/projects/pr-review"). */
  endpoint: string;
  /** Conversation history to send. */
  messages: ChatTurn[];
  /** Called for every decoded text chunk as it arrives. */
  onDelta: (text: string) => void;
  /** Optional abort signal — cancel the request mid-stream. */
  signal?: AbortSignal;
};

/**
 * POSTs messages to a streaming chat endpoint and forwards plain UTF-8 text
 * chunks into <c>onDelta</c>. Generic over endpoint so each project demo
 * (chat, pr-review, etc.) can reuse the same wire-up.
 */
export async function streamChat({
  endpoint,
  messages,
  onDelta,
  signal,
}: StreamChatOptions): Promise<void> {
  try {
    const response = await apiClient.post<ReadableStream<Uint8Array>>(
      endpoint,
      { messages },
      {
        responseType: "stream",
        signal,
      }
    );

    const stream = response.data;
    if (!stream || typeof stream.getReader !== "function") {
      throw new Error("No response body to read.");
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDelta(decoder.decode());
        break;
      }
      if (value) onDelta(decoder.decode(value, { stream: true }));
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
