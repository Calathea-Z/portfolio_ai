import { useEffect, useState } from "react";
import type { UiMessage } from "@/lib/chat-history-storage";
import { persistMessages, readStoredMessages } from "@/lib/chat-history-storage";

/** Keeps chat messages in state and mirrors them to `localStorage`. */
export function usePersistedChatMessages() {
  const [messages, setMessages] = useState<UiMessage[]>(() => readStoredMessages());

  useEffect(() => {
    persistMessages(messages);
  }, [messages]);

  return { messages, setMessages };
}
