import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { SidePanel } from "@/components/SidePanel";
import { About } from "@/components/sections/About";
import { ChatSection } from "@/components/sections/ChatSection";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Hero } from "@/components/sections/Hero";
import { StickyNav } from "@/components/sections/StickyNav";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-bg text-text">
      <BackgroundOrbs />
      <StickyNav />
      <main className="relative">
        <Hero />
        <About />
        <ChatSection />
        <FeaturedProjects />
        <Experience />
        <Contact />
      </main>
      <SidePanel mobileMenu={false} />
    </div>
  );
}
