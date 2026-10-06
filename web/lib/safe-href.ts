const linkedInLabel = /^linked\s*in$/i;

/**
 * Allow only http(s), mailto, and in-app hash/path links for rendered markdown.
 * A bare "LinkedIn" label resolves to the canonical profile URL.
 */
export function safeHref(href?: string, linkedInProfile?: string): string | undefined {
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

  if (linkedInProfile && linkedInLabel.test(h)) return linkedInProfile;

  return undefined;
}

/**
 * Turns a bare LinkedIn label, or a markdown link whose target is only the word
 * LinkedIn, into a link to the profile. Existing real URLs are left alone.
 */
export function linkifyLinkedInMentions(content: string, profileUrl: string): string {
  const profile = profileUrl.trim();
  if (!profile) return content;

  return content.replace(
    /\[([^\]]*)\]\(([^)]*)\)|(^|[\s("'[*])(LinkedIn)(?=$|[\s).,!?:;"'*])/gi,
    (match, label: string | undefined, href: string | undefined, prefix: string | undefined, word: string | undefined) => {
      if (label !== undefined && href !== undefined) {
        if (safeHref(href)) return match;
        if (linkedInLabel.test(href) || linkedInLabel.test(label)) {
          const text = label.trim() || "LinkedIn";
          return `[${text}](${profile})`;
        }
        return match;
      }

      return `${prefix ?? ""}[${word}](${profile})`;
    }
  );
}
