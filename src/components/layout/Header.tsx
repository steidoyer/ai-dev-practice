'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'

const navLinks = [
  { label: 'Mind',    href: '#approach' },
  { label: 'Road', href: '#journey' },
  { label: 'Work',    href: '#projects' },
  { label: 'Skills',  href: '#skills' },
  { label: 'Contact', href: '#contact' },
] as const

export default function Header() {
  const [open, setOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const close = () => setOpen(false)

  // 모바일 메뉴 슬라이드+페이드. 모션 최소화 선호 시 페이드만.
  const panelInitial = prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
  const panelAnimate = prefersReducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }

  return (
    <header className="sticky top-0 z-20 bg-bg">
      <div className="container-page flex h-20 items-center justify-between">
        <a
          href="#hero"
          onClick={close}
          className="font-code text-lg font-bold text-primary whitespace-nowrap"
        >
          {'<DEV STUDIO />'}
        </a>

        {/* 데스크탑/태블릿(md+) 가로 네비 */}
        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex list-none items-center gap-nav">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="font-code text-sm font-medium text-secondary whitespace-nowrap"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 모바일(md 미만) 햄버거 토글 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="text-primary md:hidden"
        >
          {open ? <FiX className="size-6" /> : <FiMenu className="size-6" />}
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="overflow-hidden border-t border-border bg-bg md:hidden"
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelInitial}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ul className="container-page flex list-none flex-col gap-inner py-group">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={close}
                    className="block py-2 font-code text-base font-medium text-secondary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
