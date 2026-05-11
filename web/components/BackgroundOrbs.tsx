/**
 * Fixed ambient layer: soft diagonal pastel washes, a tilted “slab,” and
 * blurred orbs. Theme tokens live in globals.css (--ambient-*, --orb-*).
 */
export function BackgroundOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Crossed diagonal washes — reads as color without hard edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(118deg, var(--ambient-diag-a) 0%, transparent 42%),
            linear-gradient(302deg, var(--ambient-diag-b) 0%, transparent 38%),
            linear-gradient(185deg, var(--ambient-diag-c), transparent 52%)
          `,
        }}
      />

      {/* Skewed pastel / glass slab — bottom-right anchor */}
      <div
        className="absolute -bottom-10 -right-24 h-[min(42vh,22rem)] w-[min(92vw,36rem)] -rotate-[10deg] rounded-[2.25rem] dark:-bottom-14 dark:h-[min(38vh,20rem)]"
        style={{
          background: "var(--ambient-slab-fill)",
          border: "1px solid var(--ambient-slab-border)",
          boxShadow: "0 48px 100px -28px var(--ambient-slab-glow)",
        }}
      />

      {/* Narrow accent ribbon — top-left, opposite corner for balance */}
      <div
        className="absolute -left-[12%] top-[6%] h-32 w-[min(55vw,24rem)] rotate-[9deg] rounded-full opacity-80 blur-2xl dark:opacity-90"
        style={{
          background: "linear-gradient(90deg, var(--ambient-diag-b), transparent)",
        }}
      />

      <div
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "var(--orb-1)" }}
      />
      <div
        className="absolute -right-24 -bottom-40 h-[28rem] w-[28rem] max-w-[110vw] rounded-full blur-3xl"
        style={{ background: "var(--orb-2)" }}
      />
    </div>
  );
}
