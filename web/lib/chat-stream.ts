import axios from "axios";
import { apiClient } from "@/lib/api-client";

export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * POSTs messages to the API and streams plain UTF-8 text chunks into onDelta.
 */
export async function streamChat(
  messages: ChatTurn[],
  onDelta: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await apiClient.post<ReadableStream<Uint8Array>>(
      "/chat",
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
