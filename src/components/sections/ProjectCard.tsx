'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

type ProjectCardProps = {
  title: string
  description: string
  tags: readonly string[]
  href: string
  /** 카드 썸네일 이미지 경로(public/ 또는 remotePatterns 허용 외부 URL). 없으면 플레이스홀더 렌더. */
  image?: string
  /** 이미지 대체 텍스트. 생략 시 제목 기반 기본값 사용. */
  imageAlt?: string
  /** 첫 화면(above the fold) 이미지에만 true. 나머지는 기본 lazy 로딩. */
  priority?: boolean
}

/**
 * 프로젝트 카드. hover 시 카드가 살짝 떠오르고(y/scale) 내부 이미지가 줌된다.
 * 등장 애니메이션(FadeIn)은 부모가 담당하고, 이 컴포넌트는 hover 상호작용만 책임진다.
 * variants "hover"를 부모→이미지로 전파해 부모 hover 하나로 둘을 함께 움직인다.
 */
export default function ProjectCard({
  title,
  description,
  tags,
  href,
  image,
  imageAlt,
  priority = false,
}: ProjectCardProps) {
  const prefersReducedMotion = useReducedMotion()

  const cardVariants = prefersReducedMotion ? undefined : { hover: { y: -8, scale: 1.02 } }
  const imageVariants = prefersReducedMotion ? undefined : { hover: { scale: 1.05 } }

  return (
    <motion.a
      href={href}
      variants={cardVariants}
      whileHover="hover"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex h-full w-full cursor-pointer flex-col justify-between rounded-xl border border-border bg-surface p-card"
    >
      <div className="flex flex-col gap-group">
        {/* Title + link icon */}
        <div className="flex items-start justify-between">
          <h3 className="font-heading font-semibold text-2xl text-primary">{title}</h3>
          <span className="shrink-0 text-secondary" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M5 13L13 5M13 5H7M13 5V11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {/*
          이미지 슬롯. 바깥 div가 h-40으로 높이를 확정하므로 이미지 로드 전후 레이아웃이
          흔들리지 않는다(CLS 방지). image가 있으면 next/image(fill), 없으면 플레이스홀더.
        */}
        <div className="relative h-40 shrink-0 overflow-hidden rounded-lg border border-border bg-bg">
          <motion.div
            variants={imageVariants}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative h-full w-full"
          >
            {image ? (
              <Image
                src={image}
                alt={imageAlt ?? `${title} 미리보기`}
                fill
                /* 카드 폭: lg 3열(≈400px) / md 2열(≈45vw) / 모바일 1열(≈92vw) */
                sizes="(min-width: 1024px) 400px, (min-width: 768px) 45vw, 92vw"
                className="object-cover"
                priority={priority}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-muted"
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="1" y="1" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M1 15l5-5 4 4 3-3 8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </motion.div>
        </div>

        {/* Description */}
        <p className="font-body text-[0.9375rem] leading-relaxed text-secondary">{description}</p>
      </div>

      {/* Skill tags */}
      <div className="flex flex-wrap gap-tag pt-card">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-sm bg-accent-subtle px-[0.625rem] py-1 font-code text-xs font-medium text-accent"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.a>
  )
}
