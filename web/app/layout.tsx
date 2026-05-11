import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zach Sykes — Full-stack engineer shipping AI features",
  description:
    "Full-stack engineer building production AI features end-to-end — React/Typescript, Blazor + .NET on Azure. Featured projects demonstrate RAG, agentic tool use, evals, and MCP. Chat with a resume-grounded agent or browse the work.",
  metadataBase: new URL("https://zachsykes.dev"),
  openGraph: {
    title: "Zach Sykes — Full-stack engineer shipping AI features",
    description:
      "Featured projects demonstrate RAG, agentic tool use, evals, and MCP — plus a resume-grounded chat agent.",
    url: "https://zachsykes.dev",
    siteName: "zachsykes.dev",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "zachsykes.dev developer portfolio preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zach Sykes — Full-stack engineer shipping AI features",
    description:
      "Featured AI projects with grounded demos, plus a resume chat agent for recruiters and hiring managers.",
    images: ["/og-image.svg"],
  },
};

const themeBootstrap = `(()=>{try{const s=localStorage.getItem('theme');const m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&m))document.documentElement.classList.add('dark');}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
