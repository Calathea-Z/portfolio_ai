import type { Metadata } from "next";
import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ChatInterface } from "@/components/ChatInterface";
import { SidePanel } from "@/components/SidePanel";

export const metadata: Metadata = {
  title: "Chat with Zach's AI agent · zachsykes.dev",
  description:
    "Standalone chat with a resume-grounded assistant about Zach Sykes's experience, projects, and engineering approach.",
};

export default function ChatPage() {
  return (
    <div className="relative flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden overscroll-none bg-bg">
      <BackgroundOrbs />
      <SidePanel />
      <ChatInterface />
    </div>
  );
}
