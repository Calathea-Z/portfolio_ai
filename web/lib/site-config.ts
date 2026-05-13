/**
 * Shared site-wide configuration: contact URLs, resume download location.
 * Reads from NEXT_PUBLIC_* env vars at module load, with sensible fallbacks.
 *
 */

const fallbackDocxPath = "/Sykes_Zach_Resume_2026_Default.docx";

const pdfUrl = process.env.NEXT_PUBLIC_RESUME_PDF_URL?.trim() || undefined;

export const siteConfig = {
  name: "Zach Sykes",
  role: "Full-stack engineer",
  location: "Denver, CO (remote-first)",
  positioning:
    "Full-stack engineer with deep expertise in React, TypeScript, and .NET. I've built systems end-to-end—frontend through APIs, deployment pipelines, and production observability. My day job runs on Azure, but I'm vendor-agnostic and ship quickly on whatever infrastructure your team owns. I'm thoughtful about where AI adds real value—not reflexive about it—and equally comfortable with traditional software patterns.",
  github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/Calathea-Z",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/in/zach-sykes/",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "zsykes21@gmail.com",
  freelance: "https://www.calathea.design/",
  resume: {
    href: pdfUrl ?? fallbackDocxPath,
    label: pdfUrl ? "PDF" : "DOCX",
    fallbackDocxHref: fallbackDocxPath,
    hasDedicatedPdf: Boolean(pdfUrl),
  },
} as const;

export const sectionIds = {
  hero: "top",
  about: "about",
  chat: "chat",
  projects: "projects",
  experience: "experience",
  contact: "contact",
} as const;
