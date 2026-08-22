'use client'

import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'
import { motion } from 'framer-motion'

type FadeInProps = {
  children: React.ReactNode
  /** 순차 등장을 위한 지연(초). 카드/아이템은 index * 0.1 식으로 준다. */
  delay?: number
  /** motion 요소에 그대로 전달할 클래스 (레이아웃은 호출부가 담당) */
  className?: string
}

/**
 * 뷰포트 진입 시 아래(y 24px)에서 위로 페이드인되는 재사용 래퍼.
 * 색상은 자식이 담당하고, 이 컴포넌트는 레이아웃/애니메이션만 책임진다.
 * 모션 최소화 선호 사용자는 애니메이션 없이 즉시 최종 상태로 렌더한다.
 */
export default function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduce = useReducedMotionSafe() 
  
  const hidden = { opacity: 0, y: 24 }

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={reduce ? {duration: 0 } : { duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
