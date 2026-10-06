/**
 * Hosts stored in resume facts. Chat copy cites these; the page rewrites them
 * when the visitor is on another allowed origin (local or a preview deploy).
 */
const canonicalPortfolioHosts = ["www.zachsykes.dev", "zachsykes.dev"] as const;

export function rewritePortfolioLinks(text: string, pageOrigin: string): string {
  let origin: URL;
  try {
    origin = new URL(pageOrigin);
  } catch {
    return text;
  }

  const host = origin.hostname.toLowerCase();
  if (canonicalPortfolioHosts.some((canonical) => canonical === host)) return text;

  const base = origin.origin;
  const withAbsolute = text.replace(
    /https?:\/\/(?:www\.)?zachsykes\.dev(?=\/|\?|#|"|'|\)|\]|>|\s|$)/gi,
    base
  );
  return withAbsolute.replace(
    /(^|[\s(\[])(?:www\.)?zachsykes\.dev(?=\/|\?|#|\)|\]|\s|$)/gi,
    `$1${origin.host}`
  );
}
