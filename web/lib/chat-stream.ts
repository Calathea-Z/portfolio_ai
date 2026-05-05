export type ChatTurn = { role: "user" | "assistant"; content: string };

function getChatBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CHAT_API_URL?.trim();
  if (base) return base.replace(/\/$/, "");

  // In local dev, some toolchains can fail to inline NEXT_PUBLIC_* values.
  // Fall back to the default API URL so chat still works on localhost.
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5063";
    }
  }

  throw new Error(
    "NEXT_PUBLIC_CHAT_API_URL is not set."
  );
}

/**
 * POSTs messages to the .NET API and streams plain UTF-8 text chunks into onDelta.
 */
export async function streamChat(
  messages: ChatTurn[],
  onDelta: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${getChatBaseUrl()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const ct = res.headers.get("content-type");
      if (ct?.includes("application/json")) {
        const body = (await res.json()) as { error?: string };
        if (body.error) detail = body.error;
      } else {
        const text = await res.text();
        if (text) detail = text;
      }
    } catch {
      /* keep statusText */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body to read.");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onDelta(decoder.decode());
      break;
    }
    if (value) onDelta(decoder.decode(value, { stream: true }));
  }
}
