import type { Metadata } from "next";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ChatInterface } from "@/components/ChatInterface";
import { SidePanel } from "@/components/SidePanel";

export const metadata: Metadata = {
  title: "Resume chat · Zach Sykes",
  description:
    "Standalone resume-backed chat: Zach Sykes's experience, projects, and how he works—grounded in structured resume data.",
};

export default function ChatPage() {
  return (
    <div className="relative flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden overscroll-none">
      <BackgroundOrbs />
      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <SidePanel />
        <ChatInterface />
      </div>
    </div>
  );
}
