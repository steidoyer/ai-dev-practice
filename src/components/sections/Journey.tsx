'use client'

import { animate, useInView, useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import FadeIn from "../motion/FadeIn";
import { useLayoutEffect, useRef } from "react";
import JourneyItem from "./JourneyItem";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useIsDesktop } from "@/hooks/useIsDesktop";

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
    title: '기획·디자인·개발의 융합형', // 이건 강조 효과 때문에 하드코딩. 추후 필요시 데이터 형식 변경
    desc: 'Approach의 정체성으로 수렴',
  },
]

export default function Journey() {
  const reduce = useReducedMotionSafe();
  const isDesktop = useIsDesktop();

  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const listTargetRef = useRef(null);
  const inView = useInView(listTargetRef, {once: true});

  const latched = useMotionValue(0);

  useLayoutEffect(() => {
    if (reduce) {
      latched.set(1);
    }
    if (!isDesktop && !reduce && inView) {
      const controls = animate(latched, 1, {duration: 1.8, ease: 'easeOut'});
      return () => {
        controls.stop();
      }
    }
  }, [reduce, latched, isDesktop, inView]);

  useMotionValueEvent(scrollYProgress, 'change', (v) =>{
    if (isDesktop && v > latched.get()) {
      latched.set(v);
    }
  })

  return (
    <section id="journey"
      className={`relative flex min-h-screen flex-col gap-nav container-page pt-32 pb-canvas ${reduce ? 'md:h-auto' : 'md:h-[100rem]'} md:pt-[15rem]`}
      ref={targetRef}
    >
      <div  className="md:sticky md:top-20">
        <FadeIn>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-element">
              <span className="font-code text-sm text-accent">{'// JOURNEY'}</span>
              <h2 className='font-korean font-semibold text-3xl text-primary md:text-section md:leading-tight'>여기까지 걸어온 길</h2>
            </div>
          </div>
        </FadeIn>
        <div className="flex pt-[5.5rem] pl-[0.12rem] md:pt-[7.25rem] md:pl-[1.2rem]" ref={listTargetRef}>
          <div className="relative">
            <ol className="flex flex-col">
              {journeyTrack.map((item, index) => {
                return (
                  <JourneyItem
                  key={index} item={item}
                    latched={latched} index={index} length={journeyTrack.length}
                  />
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}