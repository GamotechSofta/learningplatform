import { useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import SectionHeading from '../components/common/SectionHeading'
import Button from '../components/common/Button'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Contact"
          title="Get in touch"
          subtitle="Have a question about courses, the app, or partnerships? We'd love to hear from you."
        />

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'support@vidyank.com' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
              { icon: MapPin, label: 'Address', value: 'Pune, Maharashtra, India' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-secondary">{item.label}</div>
                  <div className="mt-0.5 font-medium text-text-primary">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
            >
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary">Message sent!</h3>
                  <p className="mt-2 text-text-secondary">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text-primary">
                        Full name
                      </label>
                      <input
                        id="name"
                        name="name"
                        required
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-text-primary">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="mt-5">
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text-primary">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <Button type="submit" size="lg" className="mt-6">
                    Send Message
                    <Send className="h-4 w-4" />
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
