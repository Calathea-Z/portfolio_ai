import { useLayoutEffect, useRef } from "react";
import type { UiMessage } from "@/lib/chat-history-storage";

/**
 * Ref for a scrollable container; scrolls to the bottom when messages change or while streaming.
 */
export function useStickToBottom(messages: UiMessage[], isStreaming: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  return ref;
}
