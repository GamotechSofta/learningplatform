import { Download, GraduationCap, Play } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'

const steps = [
  {
    step: '01',
    icon: Download,
    title: 'Download the app',
    description: 'Get Vidyank on Android or iOS and sign in with your account.',
    bgImage: '/downloadIcon.jpg',
  },
  {
    step: '02',
    icon: GraduationCap,
    title: 'Pick your path',
    description: 'Browse categories from school subjects to JEE and professional IT skills.',
    bgImage: '/set-path.png',
  },
  {
    step: '03',
    icon: Play,
    title: 'Learn & certify',
    description: 'Watch HD lessons, track progress, and earn certificates as you finish.',
    bgImage: '/learn-certify.jpg',
  },
]

export default function HowItWorks() {
  return (
    <section className="border-b border-border bg-surface py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="How it works"
          title="Start learning in three simple steps"
          subtitle="No complicated setup — enroll, watch, and grow at your own pace."
        />

        <div className="relative grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute top-12 hidden h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

          {steps.map((item) => (
            <div
              key={item.step}
              className={`relative overflow-hidden rounded-2xl border p-8 transition-[border-color,background-color] duration-300 ${
                item.bgImage
                  ? 'border-primary/25 hover:border-primary/40'
                  : 'border-border bg-background hover:border-primary/35 hover:bg-primary/[0.03]'
              }`}
            >
              {item.bgImage && (
                <>
                  <img
                    src={item.bgImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/92 to-background/55" />
                </>
              )}

              <div className="relative z-10">
                <span className="font-display text-5xl font-extrabold text-primary/15">{item.step}</span>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
