import { ArrowRight } from 'lucide-react'
import Button from '../common/Button'
import AppDownloadButton from '../common/AppDownloadButton'

export default function CTABanner() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 sm:px-12 lg:px-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Start learning today — on web or mobile
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
                Download the Vidyank app for offline videos, progress sync, and notifications.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  to="/download"
                  variant="inverse"
                  size="lg"
                >
                  Download App
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <AppDownloadButton className="shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
