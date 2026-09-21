import SectionHeading from '../components/common/SectionHeading'
import { companyInfo, formatCompanyAddress } from '../config/company'

const sections = [
  {
    title: '1. Introduction',
    body: `This Cancellation Policy explains our guidelines regarding the cancellation of subscriptions or courses on Vidyank, operated by ${companyInfo.name}.`,
  },
  {
    title: '2. Cancellation Rules',
    body: 'You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing cycle. Access to the content will remain active until that time.',
  },
  {
    title: '3. Contact us',
    body: `If you have questions about our cancellation policy, contact us at:\n\n${companyInfo.name}\n${formatCompanyAddress()}\nEmail: support@vidyank.com\nPhone: +91 98765 43210`,
  },
]

export default function CancellationPolicyPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Legal"
            title="Cancellation Policy"
            align="left"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
                {section.body && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                    {section.body}
                  </p>
                )}
                {section.list && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
