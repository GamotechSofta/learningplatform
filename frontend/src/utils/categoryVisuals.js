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

const DEFAULT = {
  Icon: BookOpen,
  accent: 'text-primary',
  iconBg: 'bg-primary/10',
  hoverBg: 'group-hover:bg-primary/15',
}

const RULES = [
  { match: (s, n) => s.includes('aws') || n.includes('devops'), Icon: Cloud, accent: 'text-sky-500', iconBg: 'bg-sky-500/10', hoverBg: 'group-hover:bg-sky-500/15' },
  { match: (s, n) => s.includes('cyber') || n.includes('security'), Icon: Shield, accent: 'text-violet-500', iconBg: 'bg-violet-500/10', hoverBg: 'group-hover:bg-violet-500/15' },
  {
    match: (s, n) => s.includes('operating-system') || n.includes('operating system') || n.includes('(os)'),
    Icon: Terminal,
    accent: 'text-slate-500',
    iconBg: 'bg-slate-500/10',
    hoverBg: 'group-hover:bg-slate-500/15',
  },
  { match: (s, n) => s.includes('skill') || n.includes('skill cour'), Icon: Wrench, accent: 'text-amber-600', iconBg: 'bg-amber-500/10', hoverBg: 'group-hover:bg-amber-500/15' },
  { match: (s, n) => s.includes('video-editing') || n.includes('video editing'), Icon: Video, accent: 'text-rose-500', iconBg: 'bg-rose-500/10', hoverBg: 'group-hover:bg-rose-500/15' },
  { match: (s, n) => s.includes('jee') || n.includes('jee main'), Icon: Target, accent: 'text-orange-500', iconBg: 'bg-orange-500/10', hoverBg: 'group-hover:bg-orange-500/15' },
  { match: (s, n) => s.includes('vocational') || n.includes('vocational'), Icon: GraduationCap, accent: 'text-indigo-500', iconBg: 'bg-indigo-500/10', hoverBg: 'group-hover:bg-indigo-500/15' },
  { match: (s, n) => s.includes('it-course') || n.includes('it course'), Icon: Computer, accent: 'text-cyan-600', iconBg: 'bg-cyan-500/10', hoverBg: 'group-hover:bg-cyan-500/15' },
  { match: (_, n) => n.includes('jee') || n.includes('exam') || n.includes('competitive'), Icon: Target, accent: 'text-orange-500', iconBg: 'bg-orange-500/10', hoverBg: 'group-hover:bg-orange-500/15' },
  { match: (_, n) => n.includes('it') || n.includes('machine') || n.includes('network'), Icon: Computer, accent: 'text-cyan-600', iconBg: 'bg-cyan-500/10', hoverBg: 'group-hover:bg-cyan-500/15' },
  { match: (_, n) => n.includes('school') || n.includes('student') || n.includes('cbse'), Icon: School, accent: 'text-emerald-600', iconBg: 'bg-emerald-500/10', hoverBg: 'group-hover:bg-emerald-500/15' },
  { match: (_, n) => n.includes('college') || n.includes('youth'), Icon: GraduationCap, accent: 'text-indigo-500', iconBg: 'bg-indigo-500/10', hoverBg: 'group-hover:bg-indigo-500/15' },
  { match: (_, n) => n.includes('entrepreneur') || n.includes('business'), Icon: Rocket, accent: 'text-amber-600', iconBg: 'bg-amber-500/10', hoverBg: 'group-hover:bg-amber-500/15' },
]

export function getCategoryVisual(category) {
  const slug = (category.slug || '').toLowerCase()
  const name = (category.title || category.name || '').toLowerCase()
  const rule = RULES.find((r) => r.match(slug, name))
  if (!rule) return DEFAULT
  return {
    Icon: rule.Icon,
    accent: rule.accent,
    iconBg: rule.iconBg,
    hoverBg: rule.hoverBg,
  }
}
