'use client'

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import FadeIn from "../motion/FadeIn";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { FiGitMerge, FiLayout, FiMousePointer, FiZap } from "react-icons/fi";

const servicesCard = [
  {
    title: '웹 프론트엔드 구축',
    icon: FiLayout,
    subTitle: '접근성 있는 UI를 처음부터',
    detailText: '디자인 시안을 바로 쓸 수 있는 화면으로 옮깁니다 — 구조부터 반응형까지.',
    detailList: [
      '— 모바일 우선 반응형 레이아웃',
      '— 시맨틱 마크업 · 키보드 지원',
      '— 재사용 가능한 컴포넌트 설계'
    ]
  },
  {
    title: '인터랙션 · 모션',
    icon: FiMousePointer,
    subTitle: '스크롤·제스처 기반 연출',
    detailText: '정적인 화면에 맥락 있는 움직임을 더합니다 — 과하지 않게, 성능을 지키며.',
    detailList: [
      '— 스크롤 · 제스처 기반 연출',
      '— framer-motion 기반 전환 애니메이션',
      '— reduced-motion 등 모션 접근성'
    ]
  },
  {
    title: '성능 · 접근성',
    icon: FiZap,
    subTitle: '빠르고 모두가 쓰는 화면',
    detailText: '빠르게 뜨고, 누구나 쓸 수 있는 화면을 만듭니다.',
    detailList: [
      '— LCP · CLS 등 핵심 지표 관리',
      '— 시맨틱 구조 · 스크린리더 대응',
      '— 키보드 전용 내비게이션 지원'
    ]
  },
  {
    title: '기획–디자인–개발 브리지',
    icon: FiGitMerge,
    subTitle: '경계 사이를 잇는 역할',
    detailText: '기획 · 디자인 · 개발 사이의 말을 옮기며 간극을 좁힙니다.',
    detailList: [
      '— 디자인 의도를 코드 제약으로 번역',
      '— 구현 가능성 기준의 피드백',
      '— Approach의 "융합형" 역할과 연결'
    ]
  },
]


export default function Services() {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());
  const reduce = useReducedMotionSafe();
  const allOpen = openSet.size === servicesCard.length;

  // 카드 등장 스태거 오케스트레이션: 부모가 staggerChildren으로 자식(카드) 등장을 지휘.
  // reduce(모션 최소화)면 간격·이동/페이드 없이 바로 보이게 가드.
  const listVariants: Variants = {
    hidden: {},
    show: { transition: reduce ? {} : { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVariants: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      };

  // 카드 토글: Set은 참조로 변경을 감지하므로 반드시 '새 Set'을 만들어 교체한다.
  const onCardClickHandler = (index: number) => {
    setOpenSet(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // 전체 토글: 다 열려 있으면 모두 닫고(빈 Set), 아니면 모두 연다(전체 index Set).
  const onToggleAll = () => {
    setOpenSet(allOpen ? new Set() : new Set(servicesCard.map((_, i) => i)));
  };

  return (
    <section id="services" className="min-h-screen container-page pt-32 pb-canvas">
      <FadeIn>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-element">
            <span className="font-code text-sm text-accent">{'// SERVICES'}</span>
            <h2 className='font-korean font-semibold text-3xl text-primary md:text-section md:leading-tight'>이렇게 함께 일할 수 있어요</h2>
          </div>
          <button
            type="button"
            onClick={onToggleAll}
            className="hidden md:block font-code text-sm text-secondary hover:text-accent transition-colors cursor-pointer"
          >
            {allOpen ? '모두 접기' : '모두 펼치기'}
          </button>
        </div>
      </FadeIn>
      <div className="pt-[3.5rem]">
        <motion.ul
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
        >
          {servicesCard.map((item, index) => {
            return (
              <motion.li
                key={index}
                variants={itemVariants}
                whileHover={reduce ? undefined : { y: -2 }}
                className="flex flex-col gap-4 p-[1.75rem] border border-border rounded-2xl bg-surface transition-colors duration-200 ease-out hover:border-accent"
              >
                <h3>
                  <button className="flex flex-col gap-4 w-full text-left cursor-pointer" aria-expanded={openSet.has(index)} aria-controls={`svc-detail-${index}`} onClick={() => onCardClickHandler(index)}>
                    <div className="flex justify-between">
                      <span className="size-[2.75rem] bg-accent-subtle border border-icon-border rounded-xl flex items-center justify-center text-accent">
                        <item.icon aria-hidden className="size-5" />
                      </span>
                      <span aria-hidden className="text-accent">
                        {openSet.has(index) ? '−' : '+'}
                      </span>
                    </div>
                    <span className="text-[1.375rem] font-semibold text-primary font-korean">{item.title}</span>
                  </button>
                </h3>
                <div>
                  <p className="text-base text-secondary">{item.subTitle}</p>
                </div>
                <AnimatePresence initial={false}>
                  {openSet.has(index) && (
                    <motion.div
                      key="detail"
                      id={`svc-detail-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border pt-4">
                        <p className="text-base text-secondary leading-relaxed">{item.detailText}</p>
                        <ul className="mt-3 flex flex-col gap-1 text-sm text-secondary">
                          {item.detailList.map((detailItem, detailIndex) => (
                            <li key={detailIndex}>{detailItem}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
          )
        })}
        </motion.ul>
      </div>
    </section>
  )
}
