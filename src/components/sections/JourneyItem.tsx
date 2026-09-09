'use client'

import { motion, MotionValue, useMotionTemplate, useTransform, type MotionStyle } from "framer-motion";
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

export default function JourneyItem(props: { latched: MotionValue<number>; item: { year: string; title: string; desc: string; }; index: number; length: number; }) {
  const reduce = useReducedMotionSafe();
  
  const { latched, index, length, item } = props;
  
  const total = 2 * (length - 1);

  const seg = [(2*index-1)/total, (2*index)/total]; // lineTop, dot, box-shadow
  const segBottom = [(2*index)/total, (2*index+1)/total]; // lineBottom (다름!)
  const appear = index === 0 ? [0, 1/total] : seg; // card·dot 등장 (첫 노드 예외)

  const lineTop = useTransform(latched, seg, [0, 1], {
    clamp: true
  });

  const lineBottom = useTransform(latched, segBottom, [0, 1], {
    clamp: true
  });

  const card = useTransform(latched, appear, {
    y:[-30, 0], opacity: [0, 1],
  });

  const dot = useTransform(latched, appear, {
    opacity: [0, 1],
    scale: index === length-1 ? [0.5, 1.2] : [1, 1],
  });

  const gap = useTransform(latched, seg, [0, 4]);
  const outer = useTransform(latched, seg, [0, 7]);
  const blur = useTransform(latched, seg, [0, 20]);
  const spread = useTransform(latched, seg, [0, 4]);

  const boxShadow = useMotionTemplate`
                    0 0 0 ${gap}px var(--color-bg),
                    0 0 0 ${outer}px var(--color-accent),
                    0 0 ${blur}px ${spread}px var(--color-accent)`;

  const textColor = useTransform(latched, seg, [0, 1]);

  const pointerEvents = useTransform(latched, (v) => v >= appear[1] ? 'auto' : 'none');

  return (
    <li className="flex md:gap-[3.3rem] gap-[1.12rem]">
      <div className="flex flex-col items-center">
        <motion.div className={`w-[2px] flex-1 origin-top ${index === 0 ? 'bg-transparent' : 'bg-accent'}`} style={{scaleY: lineTop}}></motion.div>
        <motion.div className="relative size-[1rem] rounded-full bg-accent" style={dot}>
          {index === length-1 ? <motion.div className="absolute top-0 left-0 size-[1rem] rounded-full bg-accent" style={{boxShadow}}></motion.div> : null}
        </motion.div>
        <motion.div className={`w-[2px] flex-1 origin-top ${index === length-1 ? 'bg-transparent' : 'bg-accent'}`} style={{scaleY: lineBottom}}></motion.div>
      </div>
      <motion.div className="flex-1 rounded-xl px-card border border-transparent transition-colors duration-200 ease-out hover:bg-accent-subtle hover:border-accent" whileHover={{
        y: reduce ? 0 : -2,
      }} style={{
        pointerEvents,
      }}>
        <motion.div className="flex flex-col py-[2.35rem] md:py-[1.75rem]" style={card}>
          <span className="font-code text-accent text-[0.8125rem] md:text-sm">{item.year}</span>
          {index === length-1 ? 
          <h3 className="font-korean font-semibold text-lg md:text-2xl">기획·디자인·개발의 <motion.span className='max-md:text-accent md:text-accent-color-wipe' style={{['--wipe']: textColor} as MotionStyle}>융합형</motion.span></h3>
          :
          <h3 className="font-korean font-semibold text-lg md:text-2xl">{item.title}</h3>
          }
          <span className="font-korean text-secondary text-sm md:text-base">{item.desc}</span>        
        </motion.div>
      </motion.div>
    </li>
  )
}