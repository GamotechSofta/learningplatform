import { Download, MonitorSmartphone, Wifi, WifiOff } from 'lucide-react'
import SectionHeading from '../components/common/SectionHeading'
import Button from '../components/common/Button'

const appFeatures = [
  {
    icon: WifiOff,
    title: 'Offline Learning',
    description: 'Download lessons and watch without an internet connection.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Sync Progress',
    description: 'Your progress syncs across devices when you sign in.',
  },
  {
    icon: Wifi,
    title: 'Push Notifications',
    description: 'Stay on track with reminders and new course alerts.',
  },
]

export default function DownloadPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Mobile App"
            title="Download the Vidyank app"
            subtitle="Take your courses anywhere. Available on Android and iOS."
          />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="mx-auto max-w-xs rounded-[2.5rem] border-8 border-text-primary bg-text-primary p-2 shadow-2xl">
                <div className="overflow-hidden rounded-[2rem] bg-surface">
                  <div className="bg-primary px-6 py-8 text-white">
                    <div className="text-lg font-bold">Vidyank</div>
                    <div className="mt-1 text-sm opacity-90">Continue learning</div>
                  </div>
                  <div className="space-y-3 p-4">
                    {['Physics for JEE', 'AWS Cloud Prep', 'Class 10 Math'].map((title, i) => (
                      <div
                        key={title}
                        className="flex items-center gap-3 rounded-xl border border-border p-3"
                      >
                        <div className="h-10 w-10 rounded-lg bg-primary-light" />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-text-primary">{title}</div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-border-light">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${70 - i * 15}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                Learning that fits in your pocket
              </h2>
              <p className="mt-4 leading-relaxed text-text-secondary">
                The Vidyank mobile app gives you the full learning experience — video playback,
                course enrollment, certificates, and offline downloads. Sign in with the same
                account you use on the web.
              </p>

              <div className="mt-8 space-y-4">
                {appFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">{feature.title}</div>
                      <div className="text-sm text-text-secondary">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  href="#"
                  size="lg"
                  className="min-w-[200px]"
                >
                  <Download className="h-5 w-5" />
                  Google Play
                </Button>
                <Button href="#" variant="outline" size="lg" className="min-w-[200px]">
                  <Download className="h-5 w-5" />
                  App Store
                </Button>
              </div>

              <p className="mt-4 text-xs text-text-secondary">
                Store links will be updated when the app is published.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
