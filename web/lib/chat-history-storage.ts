import type { ChatTurn } from "@/lib/chat-stream";

export type UiMessage = ChatTurn & { id: string };

const storageKey = "zach.dev.chat.history.v1";

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function readStoredMessages(): UiMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UiMessage[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (message) =>
        message &&
        typeof message.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
    );
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
