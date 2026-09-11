'use client'

import { motion, useTransform, useScroll, useMotionValue, useMotionValueEvent, type MotionStyle } from 'framer-motion'
import FadeIn from '../motion/FadeIn'
import { useLayoutEffect, useRef} from 'react';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';
import { FiArrowDown } from "react-icons/fi";

const circles = [
  {
    circleStyle: 'top-[1.88rem] left-[1.25rem]',
  },
  {
    circleStyle: 'top-[1.88rem] right-[1.25rem]',
  },
  {
    circleStyle: 'bottom-[1.87rem] inset-x-0 mx-auto',
  }
];

const texts = [
  {
    text: '기획',
    textStyle: 'top-[7.5rem] left-[6.25rem]',
  },
  {
    text: '디자인',
    textStyle: 'top-[7.5rem] right-[6.25rem]',
  },
  {
    text: '개발',
    textStyle: 'bottom-[5.06rem] left-[16.12rem]',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
}

export default function Approach() {  
  const reduce = useReducedMotionSafe() 
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const latched = useMotionValue(0);

  useLayoutEffect(() => {
    if (reduce) {
      latched.set(1);
    }
  }, [reduce, latched]);
  
  useMotionValueEvent(scrollYProgress, 'change', 
    (v) => {
      if (v > latched.get()) {
        latched.set(v);
      }
    }
  );

  const circle1 = useTransform(latched, [0, 1], {
      x: [-100, 0], y:[-100, 0], opacity: [0, 1],
  });
  const circle2 = useTransform(latched, [0, 1], {
      x: [100, 0], y:[-100, 0], opacity: [0, 1],
  });
  const circle3 = useTransform(latched, [0, 1], {
      x: [0, 0], y:[100, 0], opacity: [0, 1],
  });

  const circleArray = [circle1, circle2, circle3];

  const textOpacity = useTransform(latched, [0.7, 1], {
    opacity: [0, 1],
  });

  const textColor = useTransform(latched, [0.3, 1], [0, 1]);

  return (
    <section
      id="approach"
      className={`container-page py-canvas ${reduce ? 'md:h-auto' : 'md:h-[100rem]'}`}
      ref={targetRef}
    >
      <div className='flex flex-col gap-[2.5rem] md:gap-[8.5rem] md:sticky md:top-20'>
        <FadeIn>
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-element">
              <span className="font-code text-sm text-accent">{'// APPROACH'}</span>
              <h2 className='font-korean font-semibold text-3xl text-primary md:text-section md:leading-tight'>나는 <motion.span className='text-accent md:text-accent-color' style={{['--mix']: textColor} as MotionStyle}>융합형</motion.span> 개발을 지향합니다</h2>
            <p className='sr-only'>기획, 디자인, 개발이 합쳐진 융합형</p>
            </div>
          </div>
        </FadeIn>

        {/* PC용 레이아웃 (원 3개가 다가와서 합쳐짐) */}
        <div className="hidden md:flex md:items-center md:justify-center" aria-hidden>
          <div className='relative size-[35rem]'>
          {circles.map((item, index) => {
            const {x, y, opacity} = circleArray[index];
            return (
              <motion.div
                key={index}
                style={{x, y, opacity}}
                className={`absolute rounded-full border-[1.5px] size-[22.5rem] border-accent bg-accent-subtle ${item.circleStyle}`}
              ></motion.div>
            )
          })}
          {texts.map((item, index) => {
            return (
              <motion.span key={index} className={`absolute font-semibold text-base ${item.textStyle}`} style={textOpacity}>{item.text}</motion.span>
            )

          })}
            <motion.span className='absolute top-[15.28rem] left-[15.41rem] font-korean text-2xl text-accent font-semibold' style={textOpacity}>융합형</motion.span>
          </div>
        </div>

        {/* 모바일용 레이아웃 (모서리가 둥근 사각형 3개를 적층하고 화살표로 결론 사각형을 가리키게 함) */}
        <motion.div variants={containerVariants} initial={reduce ? false : 'hidden'} whileInView="show" viewport={{ once: true, margin: '-80px' }} className="flex flex-col items-stretch gap-4 md:hidden" aria-hidden>
          {/* 개발, 기획, 디자인 */}
          {texts.map((item, index) => {
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col justify-center border-[1.5px] border-accent rounded-2xl text-center h-[4.5rem] text-base"
              ><span className="font-semibold">{item.text}</span></motion.div>
            )
          })}
          {/* 화살표 */}
          <motion.div variants={itemVariants} className='flex flex-col items-center text-accent'>
            <FiArrowDown className="size-7" />
          </motion.div>
          {/* 융합형 */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-center bg-accent rounded-2xl text-center h-[4.5rem] text-xl text-primary"
          >
            <div className='font-semibold'>융합형</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}