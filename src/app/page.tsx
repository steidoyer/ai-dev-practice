import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import CTA from "@/components/sections/CTA";
import Approach from "@/components/sections/Approach";
import Journey from "@/components/sections/Journey";

export default function Home() {
  return (
    <>
      <Hero />
      <Approach />
      <Journey />
      <Projects />
      <Skills />
      <CTA />
    </>
  );
}
