import {
  Award,
  BookOpen,
  CheckCircle2,
  LineChart,
  Smartphone,
  Video,
  WifiOff,
} from 'lucide-react'

const highlights = [
  'Board-aligned and exam-focused content',
  'Offline playback in the mobile app',
  'Certificates on every completed course',
]

const features = [
  {
    icon: Video,
    title: 'HD video lessons',
    description: 'Expert instructors, chapter-wise videos, and clear explanations you can replay anytime.',
    accent: 'text-sky-500',
    iconBg: 'bg-sky-500/10',
    hoverBg: 'group-hover:bg-sky-500/15',
  },
  {
    icon: BookOpen,
    title: 'Structured curriculum',
    description: 'Courses mapped to school boards, JEE syllabus, and industry certification paths.',
    accent: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    hoverBg: 'group-hover:bg-emerald-500/15',
  },
  {
    icon: WifiOff,
    title: 'Learn offline',
    description: 'Download lessons in the app and keep studying without worrying about connectivity.',
    accent: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    hoverBg: 'group-hover:bg-violet-500/15',
  },
  {
    icon: LineChart,
    title: 'Progress tracking',
    description: 'Pick up where you left off with synced watch history across your devices.',
    accent: 'text-orange-500',
    iconBg: 'bg-orange-500/10',
    hoverBg: 'group-hover:bg-orange-500/15',
  },
  {
    icon: Award,
    title: 'Verified certificates',
    description: 'Earn shareable certificates when you complete a course — proof of your effort.',
    accent: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    hoverBg: 'group-hover:bg-amber-500/15',
  },
  {
    icon: Smartphone,
    title: 'Built for mobile',
    description: 'Enroll, pay securely with PayU, and learn entirely through the Vidyank app.',
    accent: 'text-primary',
    iconBg: 'bg-primary/10',
    hoverBg: 'group-hover:bg-primary/15',
  },
]

function FeatureItem({ feature }) {
  const Icon = feature.icon

  return (
    <div className="group relative flex gap-4 rounded-xl border border-border bg-background p-4 transition-[border-color,background-color,padding] duration-300 hover:border-primary/35 hover:bg-primary/[0.03] hover:pl-5 sm:p-5 sm:hover:pl-6">
      <span
        aria-hidden
        className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${feature.iconBg} ${feature.hoverBg}`}
      >
        <Icon className={`h-5 w-5 ${feature.accent}`} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-base font-bold text-text-primary transition-colors duration-300 group-hover:text-primary">
          {feature.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section className="border-b border-border bg-surface py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Why Vidyank
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              One platform for school, exams &amp; skills
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              Whether you are preparing for boards, JEE, or picking up IT skills — Vidyank gives you
              structured courses, expert videos, and tools to stay on track.
            </p>

            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <FeatureItem key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
