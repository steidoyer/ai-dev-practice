const socialLinks = [
  { label: 'GitHub',   href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Email',    href: 'mailto:hello@example.dev' },
] as const

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page flex flex-col items-center gap-element py-card md:flex-row md:justify-between">
        <p className="font-code text-xs text-muted">
          © 2026 DEV STUDIO. BUILT WITH PRECISION.
        </p>

        <nav aria-label="Social links">
          <ul className="flex list-none items-center gap-nav">
            {socialLinks.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="font-code text-sm text-secondary whitespace-nowrap"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
