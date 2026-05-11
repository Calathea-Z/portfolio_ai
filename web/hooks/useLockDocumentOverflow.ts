import { useLayoutEffect } from "react";

/**
 * Prevents page scroll while the chat layout is mounted (full-height panel).
 * Pass enabled = false when the chat is embedded inside a scrolling
 * parent so the rest of the page stays scrollable.
 */
export function useLockDocumentOverflow(enabled: boolean = true) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [enabled]);
}
