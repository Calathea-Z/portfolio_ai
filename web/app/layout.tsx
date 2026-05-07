import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "zach.dev — Developer portfolio",
  description:
    "Chat assistant grounded in Zach Sykes's resume and bio. For recruiting or detailed conversations, contact Zach directly—email and LinkedIn are on the site.",
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
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
