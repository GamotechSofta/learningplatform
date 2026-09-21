import SectionHeading from '../components/common/SectionHeading'
import { companyInfo, formatCompanyAddress } from '../config/company'

const sections = [
  {
    title: '1. Introduction',
    body: `These Terms and Conditions govern your use of the Vidyank platform, operated by ${companyInfo.name}. By accessing or using our services, you agree to be bound by these terms.`,
  },
  {
    title: '2. User Accounts',
    body: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and passwords.',
  },
  {
    title: '3. Intellectual Property',
    body: 'All content on the Vidyank platform, including courses, videos, and materials, is the intellectual property of Vidyank or its content creators and is protected by copyright laws.',
  },
  {
    title: '4. Contact us',
    body: `If you have questions about these Terms and Conditions, contact us at:\n\n${companyInfo.name}\n${formatCompanyAddress()}\nEmail: support@vidyank.com\nPhone: +91 98765 43210`,
  },
]

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Legal"
            title="Terms & Conditions"
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
