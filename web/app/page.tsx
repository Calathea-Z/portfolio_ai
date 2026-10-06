import { BackgroundOrbs } from "@/components/BackgroundOrbs";
import { SidePanel } from "@/components/SidePanel";
import { About } from "@/components/sections/About";
import { ChatSection } from "@/components/sections/ChatSection";
import { CurrentWork } from "@/components/sections/CurrentWork";
import { HiringFocus } from "@/components/sections/HiringFocus";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { Hero } from "@/components/sections/Hero";
import { StickyNav } from "@/components/sections/StickyNav";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full text-text">
      <BackgroundOrbs />
      <div className="relative z-10">
        <StickyNav />
        <main className="relative">
          <Hero />
          <CurrentWork />
          <FeaturedProjects />
          <About />
          <HiringFocus />
          <ChatSection />
          <Experience />
          <Contact />
        </main>
        <SidePanel mobileMenu={false} />
      </div>
    </div>
  );
}
