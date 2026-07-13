import type { IconType } from 'react-icons'
import FadeIn from '@/components/motion/FadeIn'
import {
  SiReact,
  SiTypescript,
  SiNextdotjs,
  SiNodedotjs,
  SiGo,
  SiPython,
  SiDocker,
  SiPostgresql,
} from 'react-icons/si'
import { FaAws } from 'react-icons/fa'

type Skill = {
  name: string
  icon: IconType | null
}

const skillStack: { category: string; skills: Skill[] }[] = [
  {
    category: 'Frontend',
    skills: [
      { name: 'React',      icon: SiReact      },
      { name: 'TypeScript', icon: SiTypescript  },
      { name: 'Next.js',    icon: SiNextdotjs   },
    ],
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Node.js', icon: SiNodedotjs },
      { name: 'Go',      icon: SiGo        },
      { name: 'Python',  icon: SiPython    },
    ],
  },
  {
    category: 'Infra & Ops',
    skills: [
      { name: 'AWS',        icon: FaAws        }, // fa set (SiAmazonwebservices 없음)
      { name: 'Docker',     icon: SiDocker     },
      { name: 'PostgreSQL', icon: SiPostgresql },
    ],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="flex flex-col gap-block container-page py-canvas">
      {/* Section header */}
      <FadeIn>
        <div className="flex flex-col gap-element">
          <span className="font-code text-sm text-accent">{'// EXPERTISE'}</span>
          <h2 className="font-heading font-semibold text-section text-primary">
            {'Skills & Stack'}
          </h2>
        </div>
      </FadeIn>

      {/* Category columns */}
      <div className="grid grid-cols-1 gap-group md:grid-cols-3 md:gap-block">
        {skillStack.map(({ category, skills }, i) => (
          <FadeIn key={category} delay={i * 0.1} className="flex">
            <div className="flex flex-1 flex-col gap-[1.25rem]">
              <span className="font-code text-[0.8125rem] font-semibold uppercase text-accent">
                {category}
              </span>
              <ul className="flex flex-col gap-inner">
                {skills.map(({ name, icon: Icon }) => (
                  <li key={name} className="flex items-center gap-tag text-primary">
                    {Icon
                      ? <Icon className="size-4 shrink-0" />
                      : <span className="size-4 shrink-0" /> /* TODO: {name} 아이콘 없음 */
                    }
                    <span className="font-body text-base">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
