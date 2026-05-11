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
          What I do, and what I&apos;m looking for.
        </h2>
        <div className="mt-6 grid gap-6 text-base leading-relaxed text-secondary md:grid-cols-2">
          <p>
            I&apos;m a full-stack engineer working day-to-day in React, TypeScript, and Blazor on the front end and C# / .NET 8 on Azure for
            everything behind it. I care more about reliability and clear
            contracts between layers than about chasing new tools — and I treat
            observability as part of feature delivery, not a follow-up.
          </p>
          <p>
            I&apos;m looking for remote-first teams that take async
            communication, mentoring, and maintainable systems seriously. The
            projects below are where the AI engineering side — RAG, agentic
            tool use, evals, MCP — gets shown off in code rather than described
            in bullet points.
          </p>
        </div>
      </div>
    </section>
  );
}
