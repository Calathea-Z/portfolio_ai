import { startTransition, useEffect, useRef, useState } from "react";
import type { UiMessage } from "@/lib/chat-history-storage";
import { persistMessages, readStoredMessages } from "@/lib/chat-history-storage";

/**
 * Keeps chat messages in state and mirrors them to `localStorage`.
 *
 * Initial state is always `[]` so the first client render matches SSR (no
 * `localStorage` in `useState` initializer — that caused hydration mismatches
 * when the browser had a saved transcript).
 */
export function usePersistedChatMessages() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const skipNextPersist = useRef(true);

  useEffect(() => {
    startTransition(() => {
      setMessages(readStoredMessages());
    });
  }, []);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    persistMessages(messages);
  }, [messages]);

  return { messages, setMessages };
}
