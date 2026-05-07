export function BackgroundOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "var(--orb-1)" }}
      />
      <div
        className="absolute -bottom-40 -right-24 h-112 w-md rounded-full blur-3xl"
        style={{ background: "var(--orb-2)" }}
      />
    </div>
  );
}
