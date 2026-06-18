import { ArrowRight } from 'lucide-react'
import Button from '../common/Button'
import AppDownloadButton from '../common/AppDownloadButton'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-16 lg:grid-cols-2 lg:px-8 lg:pt-12 lg:pb-20">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-tint-border bg-primary-light px-4 py-1.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            India&apos;s trusted learning platform
          </span>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Learn without limits,{' '}
            <span className="text-primary">anytime, anywhere</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
            From Class 8 to JEE and professional IT skills — expert instructors, video lessons,
            certificates, and progress tracking in one place.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button to="/download" size="lg">
              Get the App
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-8">
            {[
              { value: '100+', label: 'Active learners' },
              { value: '100+', label: 'Courses' },
              { value: '4.8★', label: 'Average rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-primary/5">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
              alt="Students learning together"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-surface p-4 shadow-lg sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-gold/15">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">Earn Certificates</div>
                <div className="text-xs text-text-secondary">On course completion</div>
              </div>
            </div>
          </div>

          <div className="absolute -right-4 -top-4 hidden rounded-2xl border border-primary-tint-border bg-primary-light p-4 shadow-lg sm:block">
            <AppDownloadButton />
          </div>
        </div>
      </div>
    </section>
  )
}
