'use client'

import { useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import FadeIn from "../motion/FadeIn";
import { useRef } from "react";

const journeyTrack = [
  {
    year: '3000',
    title: '개발 입문',
    desc: '시작점',
  },
  {
    year: '3002',
    title: '첫 실무 프로젝트',
    desc: '실전 투입',
  },
  {
    year: '3004',
    title: '프론트엔드 심화',
    desc: '인터랙션·성능',
  },
  {
    year: '3005',
    title: '기획·디자인·개발의 융합형',
    desc: 'Approach의 정체성으로 수렴',
  },
]

export default function Journey() {
  const targetRef = useRef(null);
  const {scrollYProgress} = useScroll({
    
  })

  const latched = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) =>{
    if (v > latched.get()) {
      latched.set(v);
    }
  })

  return (
    <section id="journey"
      className="relative flex min-h-screen flex-col gap-nav container-page pt-32 pb-canvas md:pt-[15rem]"
      ref={targetRef}
    >
      <FadeIn>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-element">
              <span className="font-code text-sm text-accent">{'// JOURNEY'}</span>
              <h2 className='font-korean font-semibold text-3xl text-primary md:text-section md:leading-tight'>여기까지 걸어온 길</h2>
            </div>
          </div>
        </FadeIn>
        <div className="flex pt-[5.5rem] pl-[0.12rem] md:pt-[7.25rem] md:pl-[1.2rem]">
          <div className="relative">
            <ol className="flex flex-col">
              {journeyTrack.map((item, index) => {
                return (
                  <li
                    key={index}
                    className="flex md:gap-[3.3rem] gap-[1.12rem]"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-[2px] flex-1 ${index === 0 ? 'bg-transparent' : 'bg-accent'}`}></div>
                      <div className={`size-[1rem] rounded-full bg-accent ${index === journeyTrack.length-1 ? 'scale-[1.2] ring-2 ring-accent ring-offset-4 ring-offset-bg' : ''}`}></div>
                      <div className={`w-[2px] flex-1 ${index === journeyTrack.length-1 ? 'bg-transparent' : 'bg-accent'}`}></div>
                    </div>
                    <div className="flex flex-col py-[2.35rem] md:py-[1.75rem]">
                      <span className="font-code text-accent text-[0.8125rem] md:text-sm">{item.year}</span>
                      <h3 className="font-korean font-semibold text-lg md:text-2xl">{item.title}</h3>
                      <span className="font-korean text-secondary text-sm md:text-base">{item.desc}</span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
    </section>
  );
}