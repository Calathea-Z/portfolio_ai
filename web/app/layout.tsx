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
  title: "Zach Sykes — Full-stack engineer",
  description:
    "Portfolio and resume for Zach Sykes: full-stack work on React, TypeScript, and .NET (most production experience on Azure), plus notes on resume-backed chat and evals. Contact links included.",
  metadataBase: new URL("https://zachsykes.dev"),
  openGraph: {
    title: "Zach Sykes — Full-stack engineer",
    description:
      "Full-stack portfolio: production web work, plus notes on agentic resume chat and evals.",
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
    title: "Zach Sykes — Full-stack engineer",
    description:
      "Portfolio and resume: full-stack delivery on React and .NET, with grounded demos on a few LLM-related projects.",
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
      <body className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
        {/* beforeInteractive: inject early without nesting <script> under <head> in React tree (avoids client render warnings). */}
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
