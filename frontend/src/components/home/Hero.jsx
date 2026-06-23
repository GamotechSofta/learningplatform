import { ArrowRight, Award, PlayCircle, Sparkles } from 'lucide-react'
import Button from '../common/Button'
import AppDownloadButton from '../common/AppDownloadButton'

const floatingTags = ['JEE Prep', 'Class 8–12', 'AWS & Cloud', 'Certificates']

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="hero-grid absolute inset-0 -z-10 opacity-60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/8 via-background to-background" />
      <div className="absolute -right-24 top-0 -z-10 h-[32rem] w-[32rem] rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute -left-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-accent-gold/10 blur-[80px]" />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              India&apos;s trusted learning platform
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-[3.35rem]">
              Master every subject with{' '}
              <span className="text-gradient-primary">expert-led</span> video courses
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              School boards, JEE, IT certifications, and professional skills — structured lessons,
              offline playback, and certificates in the Vidyank app.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/download" size="lg" className="rounded-full px-7">
                Get the App
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button to="/download" variant="outline" size="lg" className="rounded-full px-7">
                Explore courses
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none animate-fade-up-delay-2">
            <div className="relative rounded-[2rem] border border-border/80 bg-surface p-3 shadow-2xl shadow-black/20">
              <div className="overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-primary/20 via-surface-elevated to-background">
                <div className="border-b border-border/60 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Continue learning
                      </p>
                      <p className="font-display text-lg font-bold text-text-primary">
                        Physics — Rotational Motion
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                      68% done
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-primary to-emerald-400" />
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  {[
                    { title: 'Torque & angular momentum', duration: '12 min', active: true },
                    { title: 'Rolling motion problems', duration: '18 min', active: false },
                    { title: 'Chapter quiz', duration: '10 min', active: false },
                  ].map((lesson) => (
                    <div
                      key={lesson.title}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                        lesson.active
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-border/60 bg-surface/60'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          lesson.active ? 'bg-primary text-white' : 'bg-border-light text-text-secondary'
                        }`}
                      >
                        <PlayCircle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-primary">{lesson.title}</p>
                        <p className="text-xs text-text-secondary">{lesson.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="animate-float absolute -left-4 top-8 hidden rounded-2xl glass-card p-4 shadow-xl sm:block lg:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-gold/15">
                  <Award className="h-5 w-5 text-accent-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Earn certificates</p>
                  <p className="text-xs text-text-secondary">On every completion</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-2 hidden sm:block lg:-right-6">
              <AppDownloadButton className="shadow-xl" />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 lg:absolute lg:-bottom-10 lg:left-6 lg:mt-0 lg:justify-start">
              {floatingTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface/90 px-3 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
