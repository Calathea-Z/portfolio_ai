/**
 * Shared site-wide configuration: contact URLs, resume download location.
 * Optional `NEXT_PUBLIC_RESUME_PDF_URL` overrides the default public PDF (e.g. CDN).
 */

const defaultResumePdfPath = "/Sykes_Zach_Resume_Default.pdf";

const resumePdfHref =
  process.env.NEXT_PUBLIC_RESUME_PDF_URL?.trim() || defaultResumePdfPath;

export const siteConfig = {
  name: "Zach Sykes",
  role: "Product-focused software engineer",
  city: "Denver, CO",
  positioning:
    "Product-focused software engineer building workflow-heavy applications with React, TypeScript, Next.js, and .NET. I build and own production applications across frontend architecture, backend APIs, cloud infrastructure, and observability, with a particular focus on making complex workflows intuitive for users.",
  /** Shorter hero copy for mobile — keeps first viewport scannable. */
  heroMobileLead:
    "Building workflow-heavy applications with React, TypeScript, Next.js, and .NET — focusing on making complex workflows intuitive.",
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
