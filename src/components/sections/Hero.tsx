'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'

// 컨테이너: 자식들을 순차(stagger) 등장시킨다. 자신은 시각 변화 없음.
const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

// 아이템: 아래에서 위로 페이드인.
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

// 스크롤 화살표: 기존 디자인(opacity-90)을 유지하도록 최종 투명도를 0.9로.
const itemArrow: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 0.9, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion()

  // 모션 최소화 선호 시: stagger/이동 없이 즉시 최종 상태로.
  const containerVariants = prefersReducedMotion ? undefined : container
  const itemVariants = prefersReducedMotion ? undefined : item
  const arrowVariants = prefersReducedMotion ? undefined : itemArrow

  // 화살표 반복 바운스. 모션 최소화 선호 시엔 정지.
  const arrowBounce = prefersReducedMotion ? undefined : { y: [0, 8, 0] }

  // 앵커 기본 점프 대신 부드러운 스크롤로 다음 섹션 이동.
  // JS scrollIntoView는 CSS의 prefers-reduced-motion을 자동 반영하지 않으므로
  // 모션 최소화 선호 시 즉시 이동('auto')으로 직접 분기한다.
  const handleScrollDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.getElementById('projects')?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <motion.section
      id="hero"
      className="relative flex min-h-screen flex-col gap-nav container-page pt-32 pb-canvas md:pt-[15rem]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* 이름 / 타이틀 */}
      <motion.div variants={itemVariants} className="flex flex-col gap-element">
        <span className="font-code text-sm text-accent">{'// INTRO'}</span>

        <div className="flex flex-col gap-tag">
          <h1 className="font-korean font-bold text-5xl leading-none text-primary md:text-7xl lg:text-hero">
            DEV STUDIO
          </h1>
          <div className="flex items-center gap-element">
            <p className="font-body text-xl text-secondary md:text-subtitle">
              Full-Stack Developer
            </p>
            <div className="h-[2px] w-10 bg-accent shrink-0" />
          </div>
        </div>
      </motion.div>

      {/* 한 줄 소개 */}
      <motion.p
        variants={itemVariants}
        className="font-body text-xl leading-relaxed text-secondary w-full max-w-[37.5rem]"
      >
        Clean code. Scalable products. Meaningful experiences.
      </motion.p>

      {/* 스크롤 화살표: 다음 섹션(#projects)으로 부드럽게 이동하는 앵커 */}
      <motion.a
        href="#projects"
        onClick={handleScrollDown}
        aria-label="Scroll to projects"
        variants={arrowVariants}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-[0.625rem] opacity-90"
      >
        <span className="font-code text-xs text-secondary">Scroll</span>
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="text-secondary"
          animate={arrowBounce}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <path
            d="M4.5 6.75L9 11.25L13.5 6.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.a>
    </motion.section>
  )
}
