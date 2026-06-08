/**
 * Shared site-wide configuration: contact URLs, resume download location.
 * Optional `NEXT_PUBLIC_RESUME_PDF_URL` overrides the default public PDF (e.g. CDN).
 */

const defaultResumePdfPath = "/Zach_Sykes_Resume_Default.pdf";

const resumePdfHref =
  process.env.NEXT_PUBLIC_RESUME_PDF_URL?.trim() || defaultResumePdfPath;

export const siteConfig = {
  name: "Zach Sykes",
  role: "Full-stack software engineer",
  city: "Denver, CO",
  positioning:
    "Full-stack software engineer building production web applications, APIs, and internal tools with React, TypeScript, .NET, Azure, and SQL. I like owning systems end-to-end: from user workflows and API design to deployment, observability, and long-term maintainability.",
  /** Shorter hero copy for mobile — keeps first viewport scannable. */
  heroMobileLead:
    "Production web applications, APIs, and internal tools with React, TypeScript, .NET, Azure, and SQL.",
  github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/Calathea-Z",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/in/zach-sykes/",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "zsykes21@gmail.com",
  portfolio: process.env.NEXT_PUBLIC_PORTFOLIO_SITE_URL ?? "https://www.zachsykes.dev/",
  freelance: "https://www.calathea.design/",
  resume: {
    href: resumePdfHref,
    label: "PDF",
  },
} as const;

export const sectionIds = {
  hero: "top",
  about: "about",
  hiring: "hiring",
  chat: "chat",
  projects: "projects",
  experience: "experience",
  contact: "contact",
} as const;
