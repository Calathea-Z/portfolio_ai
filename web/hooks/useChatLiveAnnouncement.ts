import { useEffect, useRef, useState } from "react";
import { messageText, type UiMessage } from "@/lib/chat-history-storage";

const STREAM_ANNOUNCE_MS = 2500;
const MAX_SNIPPET = 240;

function snippet(text: string): string {
  const t = text.trim();
  if (t.length <= MAX_SNIPPET) return t;
  return `${t.slice(0, MAX_SNIPPET)}…`;
}

function scheduleAnnouncement(set: (value: string) => void, value: string) {
  queueMicrotask(() => set(value));
}

/**
 * Drives a single polite live region so screen readers get chat updates without
 * announcing every streaming token.
 */
export function useChatLiveAnnouncement(messages: UiMessage[], isStreaming: boolean) {
  const [announcement, setAnnouncement] = useState("");
  const messageCountRef = useRef(0);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStreamSnippetRef = useRef("");

  useEffect(() => {
    const prevCount = messageCountRef.current;
    const count = messages.length;
    if (count < prevCount) {
      messageCountRef.current = count;
      return;
    }
    if (count <= prevCount) return;

    const added = messages.slice(prevCount);
    messageCountRef.current = count;

    const lastAdded = added.at(-1);
    if (!lastAdded) return;

    if (lastAdded.role === "user") {
      const text = messageText(lastAdded);
      scheduleAnnouncement(setAnnouncement, text ? `You: ${snippet(text)}` : "Message sent");
      return;
    }

    if (lastAdded.role === "assistant" && lastAdded.chunks.length === 0) {
      scheduleAnnouncement(setAnnouncement, "Assistant is replying");
    }
  }, [messages]);

  useEffect(() => {
    const last = messages.at(-1);
    if (!last || last.role !== "assistant") return;

    const text = messageText(last);

    if (!isStreaming) {
      if (streamTimerRef.current) {
        clearTimeout(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      lastStreamSnippetRef.current = "";
      if (text) {
        scheduleAnnouncement(setAnnouncement, `Assistant: ${snippet(text)}`);
      }
      return;
    }

    if (!text) return;

    const schedule = () => {
      const next = snippet(text);
      if (next === lastStreamSnippetRef.current) return;
      lastStreamSnippetRef.current = next;
      setAnnouncement(`Assistant: ${next}`);
    };

    if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
    streamTimerRef.current = setTimeout(schedule, STREAM_ANNOUNCE_MS);

    return () => {
      if (streamTimerRef.current) {
        clearTimeout(streamTimerRef.current);
        streamTimerRef.current = null;
      }
    };
  }, [messages, isStreaming]);

  return announcement;
}
