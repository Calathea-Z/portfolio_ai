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
  title: "zachsykes.dev — Developer portfolio",
  description:
    "Chat assistant grounded in Zach Sykes's resume and bio. For recruiting or detailed conversations, contact Zach directly—email and LinkedIn are on the site.",
  metadataBase: new URL("https://zachsykes.dev"),
  openGraph: {
    title: "zachsykes.dev — Developer portfolio",
    description:
      "Chat with a resume-grounded assistant about Zach Sykes's experience, projects, and engineering approach.",
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
    title: "zachsykes.dev — Developer portfolio",
    description:
      "Resume-grounded portfolio chat for recruiters and hiring managers.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
