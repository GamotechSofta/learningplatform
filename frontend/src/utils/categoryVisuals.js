import {
  BookOpen,
  Cloud,
  Computer,
  GraduationCap,
  Rocket,
  School,
  Shield,
  Target,
  Terminal,
  Video,
  Wrench,
} from 'lucide-react'

const DEFAULT = { Icon: BookOpen }

const RULES = [
  { match: (s, n) => s.includes('aws') || n.includes('devops'), Icon: Cloud },
  { match: (s, n) => s.includes('cyber') || n.includes('security'), Icon: Shield },
  {
    match: (s, n) => s.includes('operating-system') || n.includes('operating system') || n.includes('(os)'),
    Icon: Terminal,
  },
  { match: (s, n) => s.includes('skill') || n.includes('skill cour'), Icon: Wrench },
  { match: (s, n) => s.includes('video-editing') || n.includes('video editing'), Icon: Video },
  { match: (s, n) => s.includes('jee') || n.includes('jee main'), Icon: Target },
  { match: (s, n) => s.includes('vocational') || n.includes('vocational'), Icon: GraduationCap },
  { match: (s, n) => s.includes('it-course') || n.includes('it course'), Icon: Computer },
  { match: (_, n) => n.includes('jee') || n.includes('exam') || n.includes('competitive'), Icon: Target },
  { match: (_, n) => n.includes('it') || n.includes('machine') || n.includes('network'), Icon: Computer },
  { match: (_, n) => n.includes('school') || n.includes('student') || n.includes('cbse'), Icon: School },
  { match: (_, n) => n.includes('college') || n.includes('youth'), Icon: GraduationCap },
  { match: (_, n) => n.includes('entrepreneur') || n.includes('business'), Icon: Rocket },
]

export function getCategoryVisual(category) {
  const slug = (category.slug || '').toLowerCase()
  const name = (category.title || category.name || '').toLowerCase()
  const rule = RULES.find((r) => r.match(slug, name))
  return rule ?? DEFAULT
}
