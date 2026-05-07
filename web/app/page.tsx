import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { ChatInterface } from "@/components/ChatInterface";
import { SidePanel } from "@/components/SidePanel";

export default function Home() {
  return (
    <div className="relative flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden overscroll-none bg-bg md:flex-row">
      <BackgroundOrbs />
      <SidePanel />
      <ChatInterface />
    </div>
  );
}
