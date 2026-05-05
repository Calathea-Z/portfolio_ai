import { ChatInterface } from "@/components/ChatInterface";
import { SidePanel } from "@/components/SidePanel";

export default function Home() {
  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden overscroll-none bg-zinc-100 md:flex-row dark:bg-black">
      <SidePanel />
      <ChatInterface />
    </div>
  );
}
