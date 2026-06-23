import { ArrowRight, Sparkles } from 'lucide-react'
import Button from '../common/Button'
import AppDownloadButton from '../common/AppDownloadButton'

export default function CTABanner() {
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary via-primary to-emerald-600 px-8 py-14 sm:px-12 lg:px-16 lg:py-16">
          <div className="hero-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Free to download
              </div>
              <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
                Your next chapter starts with one tap
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85">
                Download Vidyank for offline videos, synced progress, course reminders, and secure
                PayU checkout.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button to="/download" variant="inverse" size="lg" className="rounded-full px-8">
                  Download App
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-md">
                <AppDownloadButton className="border-white/20 bg-white shadow-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
