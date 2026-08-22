import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import CTA from "@/components/sections/CTA";
import Approach from "@/components/sections/Approach";

export default function Home() {
  return (
    <>
      <Hero />
      <Approach />
      <Projects />
      <Skills />
      <CTA />
    </>
  );
}
