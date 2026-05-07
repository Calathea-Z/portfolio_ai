import type { ChatTurn } from "@/lib/chat-stream";

type Props = {
  message: ChatTurn;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      role="article"
      aria-label={isUser ? "You" : "Assistant"}
    >
      <div
        className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm transition-colors ${
          isUser
            ? "bg-primary text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] dark:shadow-[0_4px_14px_rgb(184_165_255/0.2)]"
            : "border border-border-soft/70 bg-surface-alt text-text"
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
      </div>
    </div>
  );
}
