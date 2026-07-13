import type { IconType } from 'react-icons'
import FadeIn from '@/components/motion/FadeIn'
import { SiGithub } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'
import { FiMail, FiArrowRight } from 'react-icons/fi'

const email = 'hello@example.dev'

const socialLinks: { label: string; href: string; icon: IconType }[] = [
  { label: 'GitHub',   href: '#', icon: SiGithub   }, // TODO: 실제 프로필 URL
  { label: 'LinkedIn', href: '#', icon: FaLinkedin }, // TODO: 실제 프로필 URL
]

export default function CTA() {
  return (
    <section
      id="contact"
      className="flex flex-col items-center gap-section container-page pt-canvas pb-block"
    >
      {/* Heading */}
      <FadeIn className="flex flex-col items-center gap-group">
        <span className="font-code text-sm text-accent">{'// CONTACT'}</span>
        <h2 className="font-korean text-4xl font-bold text-center text-primary md:text-display">
          같이 만들어봐요
        </h2>
        <p className="font-body text-xl text-center text-secondary">
          Open to new opportunities and interesting projects.
        </p>
      </FadeIn>

      {/* Contact actions */}
      <FadeIn delay={0.1} className="flex flex-col items-center gap-card">
        {/* Email chip */}
        <a
          href={`mailto:${email}`}
          className="flex max-w-full items-center gap-inner rounded-md border border-border bg-surface px-6 py-4 text-primary md:px-12 md:py-5"
        >
          <span className="font-code text-base font-semibold break-all md:text-lg">{email}</span>
          <FiMail className="size-5 shrink-0" />
        </a>

        {/* Social links */}
        <div className="flex flex-wrap items-center justify-center gap-group">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="flex min-h-11 items-center gap-tag text-secondary"
            >
              <Icon className="size-[1.125rem] shrink-0" />
              <span className="font-code text-sm">{label}</span>
            </a>
          ))}
        </div>

        {/* Main CTA button */}
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-inner rounded-md bg-accent px-12 py-4 text-primary md:py-5"
        >
          <span className="font-code text-lg font-bold">연락하기</span>
          <FiArrowRight className="size-[1.125rem] shrink-0" />
        </a>
      </FadeIn>
    </section>
  )
}
