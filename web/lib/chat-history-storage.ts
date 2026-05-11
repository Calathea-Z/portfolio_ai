/**
 * Chunked message model and localStorage persistence.
 */

export type MessageChunk =
  | { kind: "text"; text: string }
  | {
      kind: "tool_call";
      id: string;
      name: string;
      input: unknown;
      result?: unknown;
      error?: string;
    };

export type UiMessage = {
  id: string;
  role: "user" | "assistant";
  chunks: MessageChunk[];
};

const storageKey = "zach.dev.chat.history.v2";

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Convenience for callers that just want the concatenated text. */
export function messageText(message: UiMessage): string {
  return message.chunks
    .filter((chunk): chunk is Extract<MessageChunk, { kind: "text" }> => chunk.kind === "text")
    .map((chunk) => chunk.text)
    .join("");
}

/** Build a single-text-chunk user message. */
export function makeUserMessage(text: string): UiMessage {
  return { id: uid(), role: "user", chunks: [{ kind: "text", text }] };
}

/** Build an empty assistant placeholder that streaming events will fill. */
export function makeAssistantPlaceholder(): UiMessage {
  return { id: uid(), role: "assistant", chunks: [] };
}

export function readStoredMessages(): UiMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UiMessage[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidMessage);
  } catch {
    return [];
  }
}

export function persistMessages(messages: UiMessage[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  } catch {
    // Ignore quota / private mode.
  }
}

function isValidMessage(message: unknown): message is UiMessage {
  if (!message || typeof message !== "object") return false;
  const m = message as Partial<UiMessage>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    Array.isArray(m.chunks) &&
    m.chunks.every(isValidChunk)
  );
}

function isValidChunk(chunk: unknown): chunk is MessageChunk {
  if (!chunk || typeof chunk !== "object") return false;
  const c = chunk as Partial<MessageChunk> & { kind?: string };
  if (c.kind === "text") {
    return typeof (c as { text?: unknown }).text === "string";
  }
  if (c.kind === "tool_call") {
    const tc = c as Partial<Extract<MessageChunk, { kind: "tool_call" }>>;
    return typeof tc.id === "string" && typeof tc.name === "string";
  }
  return false;
}
