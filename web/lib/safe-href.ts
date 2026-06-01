/**
 * Allow only http(s), mailto, and in-app hash/path links for rendered markdown.
 */
export function safeHref(href?: string): string | undefined {
  if (!href?.trim()) return undefined;
  const h = href.trim();

  if (/^[\w+.-]+:/i.test(h)) {
    const lower = h.toLowerCase();
    if (lower.startsWith("mailto:")) return h;
    if (lower.startsWith("https:") || lower.startsWith("http:")) {
      try {
        const url = new URL(h);
        if (url.protocol === "http:" || url.protocol === "https:") return h;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  if (h.startsWith("#") || h.startsWith("/")) return h;
  if (h.startsWith("www.") || h.toLowerCase().startsWith("linkedin.com")) {
    return `https://${h}`;
  }

  return undefined;
}
