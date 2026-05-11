import type { MessageChunk, UiMessage } from "@/lib/chat-history-storage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolCallPill } from "@/components/ToolCallPill";

type Props = {
  message: UiMessage;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      role="article"
      aria-label={isUser ? "You" : "Assistant"}
    >
      <div className={`max-w-[min(100%,42rem)] ${isUser ? "" : "pl-2"}`}>
        <p
          className={`mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide ${
            isUser ? "justify-end text-muted" : "text-muted"
          }`}
        >
          {!isUser ? (
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
              aria-hidden="true"
            />
          ) : null}
          {isUser ? "You" : "Zach AI"}
        </p>
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm transition-all ${
            isUser
              ? "bg-primary text-primary-contrast shadow-[0_4px_14px_rgb(124_92_255/0.25)] dark:shadow-[0_4px_14px_rgb(184_165_255/0.2)]"
              : "border border-border-soft/70 border-l-4 border-l-accent bg-linear-to-br from-surface-alt to-surface text-text"
          }`}
        >
          {message.chunks.map((chunk, idx) => (
            <ChunkRenderer key={chunkKey(chunk, idx)} chunk={chunk} isUser={isUser} />
          ))}
        </div>
      </div>
    </div>
  );
}

function chunkKey(chunk: MessageChunk, idx: number): string {
  return chunk.kind === "tool_call" ? `tool-${chunk.id}` : `text-${idx}`;
}

function ChunkRenderer({ chunk, isUser }: { chunk: MessageChunk; isUser: boolean }) {
  if (chunk.kind === "tool_call") {
    return (
      <ToolCallPill
        name={chunk.name}
        input={chunk.input}
        result={chunk.result}
        error={chunk.error}
      />
    );
  }

  return <MarkdownBlock text={chunk.text} isUser={isUser} />;
}

function normalizeMarkdownLinks(content: string) {
  const withLinkedInLinks = content.replace(
    /(^|[\s(])((?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s)\]]+)/gi,
    (full, prefix: string, rawUrl: string) => {
      const href =
        rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
          ? rawUrl
          : `https://${rawUrl}`;
      return `${prefix}[${rawUrl}](${href})`;
    }
  );

  return withLinkedInLinks.replace(
    /(^|[\s(])([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})(?=$|[\s).,!?:;])/gi,
    (full, prefix: string, email: string) => `${prefix}[${email}](mailto:${email})`
  );
}

function normalizeHref(href?: string) {
  if (!href) return "#";
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
    return href;
  }
  if (href.startsWith("www.") || href.startsWith("linkedin.com")) {
    return `https://${href}`;
  }
  return href;
}

function MarkdownBlock({ text, isUser }: { text: string; isUser: boolean }) {
  const markdown = normalizeMarkdownLinks(text);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-3 whitespace-pre-wrap wrap-break-word last:mb-0">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="mb-2 text-xl font-semibold tracking-tight last:mb-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 text-lg font-semibold tracking-tight last:mb-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 text-base font-semibold last:mb-0">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote
            className={`mb-3 border-l-2 pl-3 italic last:mb-0 ${
              isUser ? "border-primary-contrast/40" : "border-primary/50"
            }`}
          >
            {children}
          </blockquote>
        ),
        hr: () => (
          <hr className={`my-3 ${isUser ? "border-primary-contrast/20" : "border-border-soft"}`} />
        ),
        a: ({ href, children }) => (
          <a
            href={normalizeHref(href)}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-4 transition-colors ${
              isUser
                ? "text-primary-contrast/95 hover:text-primary-contrast"
                : "text-primary hover:text-primary-hover"
            }`}
          >
            {children}
          </a>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code
                className={`mb-3 block overflow-x-auto rounded-xl border px-3 py-2 text-[13px] last:mb-0 ${
                  isUser
                    ? "border-primary-contrast/20 bg-black/15 text-primary-contrast"
                    : "border-border-soft bg-surface text-text"
                }`}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className={`rounded px-1 py-0.5 text-[13px] ${isUser ? "bg-black/15" : "bg-surface"}`}
            >
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="mb-3 overflow-x-auto last:mb-0">
            <table className={`w-full text-sm ${isUser ? "text-primary-contrast" : "text-text"}`}>
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th
            className={`border px-2 py-1 text-left font-semibold ${
              isUser ? "border-primary-contrast/25" : "border-border-soft"
            }`}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            className={`border px-2 py-1 align-top ${
              isUser ? "border-primary-contrast/20" : "border-border-soft"
            }`}
          >
            {children}
          </td>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
