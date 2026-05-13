import { sectionIds } from "@/lib/site-config";

export function About() {
  return (
    <section
      id={sectionIds.about}
      aria-labelledby="about-heading"
      className="scroll-mt-24 border-t border-border-subtle bg-surface/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          About
        </p>
        <h2
          id="about-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-text sm:text-3xl"
        >
          How I work
        </h2>
        <div className="mt-6 grid gap-6 text-base leading-relaxed text-secondary md:grid-cols-2">
        <p>
            I'm a full-stack engineer working day-to-day in React, TypeScript, Blazor, C#, and .NET 8. I ship features end-to-end and care deeply about reliability, clear contracts between layers, and observability baked in from the start—not retrofitted. My experience spans Azure in production, Vercel for frontend, and smaller hosts for side projects. I'm comfortable picking up whatever your stack uses; I learn deployment and monitoring patterns on the job.
          </p>
          <p>
            I'm looking for remote-first teams that value clear async communication, thorough code review, and systems you can actually debug in production. I ship across the stack—from UI to APIs to deployment—and I'm actively integrating LLM tooling where it solves real problems, not as an afterthought. Remote is my preference, but I'm open to hybrid for the right role and team.
          </p>
        </div>
      </div>
    </section>
  );
}
