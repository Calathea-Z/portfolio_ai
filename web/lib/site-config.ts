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
  location: "Denver, CO (Remote)",
  positioning:
    "Full-stack software engineer with 5+ years of experience building scalable web platforms and developer-first systems. Proven expertise in React, TypeScript, and backend patterns. Experienced shipping 0-to-1 products, building reusable component libraries, and designing APIs that scale across teams. Strong track record of collaborating with product and design partners to deliver user-focused features in fast-moving environments.",
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
  chat: "chat",
  projects: "projects",
  experience: "experience",
  contact: "contact",
} as const;
