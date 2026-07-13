import FadeIn from '@/components/motion/FadeIn'
import ProjectCard from '@/components/sections/ProjectCard'

type Project = {
  title: string
  description: string
  tags: readonly string[]
  href: string
  /** TODO: 실제 스크린샷 경로(public/projects/*.png 또는 외부 URL). 없으면 카드가 플레이스홀더를 렌더. */
  image?: string
  imageAlt?: string
}

const projects: Project[] = [
  {
    title: 'ShopFlow',
    description: 'E-commerce platform built with React + Node.js',
    tags: ['React', 'Node.js'],
    href: '#',
  },
  {
    title: 'DataPulse',
    description: 'Analytics dashboard powered by Python + D3.js',
    tags: ['Python', 'D3.js'],
    href: '#',
  },
  {
    title: 'ConnectHub',
    description: 'Social API service in Go + PostgreSQL',
    tags: ['Go', 'PostgreSQL'],
    href: '#',
  },
]

export default function Projects() {
  return (
    <section id="projects" className="flex flex-col gap-section container-page py-canvas">
      {/* Section header */}
      <FadeIn>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-element">
            <span className="font-code text-sm text-accent">{'// PROJECTS'}</span>
            <h2 className="font-heading font-semibold text-section text-primary">
              Selected Work
            </h2>
          </div>
          <span className="font-code text-sm text-secondary">
            ({projects.length}/{projects.length})
          </span>
        </div>
      </FadeIn>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-group md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <FadeIn key={project.title} delay={i * 0.1} className="flex">
            <ProjectCard
              title={project.title}
              description={project.description}
              tags={project.tags}
              href={project.href}
              image={project.image}
              imageAlt={project.imageAlt}
            />
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
