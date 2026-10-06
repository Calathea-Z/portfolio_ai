import { sectionIds } from "@/lib/site-config";

const strengths = [
  "Full-stack product engineering",
  "Production API ownership",
  "React/TypeScript frontend delivery",
  "Backend systems across stacks",
  "Observability and reliability",
  "Internal tools and stakeholder-facing systems",
];

export function HiringFocus() {
  return (
    <section
      id={sectionIds.hiring}
      aria-labelledby="hiring-heading"
      className="scroll-mt-24 border-t border-border-subtle"
    >
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Role fit
        </p>
        <h2
          id="hiring-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          What I bring
        </h2>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {strengths.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm leading-relaxed text-secondary"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl border border-border-soft bg-surface/50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Currently seeking
          </h3>
          <div className="mt-3 max-w-3xl space-y-3 text-base leading-relaxed text-secondary">
            <p>
              Looking for a full-time product engineering role where I can own a workflow from the
              interface through the API, and stay with it after it ships.
            </p>
            <p>
              Frontend and full-stack work is home base. I&apos;m also interested in backend-heavy
              product work, internal tools, and teams that treat reliability as part of the feature.
              I like partnering with product, design, and the people who use the system. Based in
              Denver, and open to hybrid or remote.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
