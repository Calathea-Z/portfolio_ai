"use client";

import { useMemo } from "react";
import { ChatInterface, type ProjectChatLift } from "@/components/ChatInterface";
import { ChatTelemetryPanel } from "@/components/ChatTelemetryPanel";
import { usePersistedChatMessages } from "@/hooks/usePersistedChatMessages";
import { useStreamingChat } from "@/lib/use-streaming-chat";

export function AgenticChatDemo() {
  const { messages, setMessages } = usePersistedChatMessages();
  const streamHeaders = useMemo(
    () => ({ "X-Chat-Trace": "1", "X-Chat-Debug": "1" }),
    []
  );
  const streaming = useStreamingChat({ messages, setMessages, streamHeaders });
  const projectChat: ProjectChatLift = { messages, setMessages, streaming };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 md:gap-4">
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-sm">
        <ChatInterface embedded projectChat={projectChat} />
      </div>
      <ChatTelemetryPanel
        variant="below-card"
        isStreaming={streaming.isStreaming}
        lastReplyUsage={streaming.lastReplyUsage}
        inFlightReplyUsage={streaming.inFlightReplyUsage}
        sessionTotals={streaming.sessionTotals}
      />
    </div>
  );
}
