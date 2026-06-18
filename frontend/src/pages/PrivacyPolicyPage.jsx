import SectionHeading from '../components/common/SectionHeading'
import { companyInfo, formatCompanyAddress } from '../config/company'

const sections = [
  {
    title: '1. Introduction',
    body: `Vidyank ("we", "our", or "us") is operated by ${companyInfo.name}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and related services (collectively, the "Services"). By using Vidyank, you agree to the practices described in this policy.`,
  },
  {
    title: '2. Information we collect',
    body: null,
    list: [
      'Account information: name, email address, phone number, and password when you register.',
      'Learning data: course progress, video watch history, saved courses, and preferences such as learning track.',
      'Payment information: transaction details processed through our payment partners (we do not store full card or UPI credentials on our servers).',
      'Device and usage data: app version, device type, operating system, IP address, and general usage analytics to improve the Services.',
      'Communications: messages you send to our support team.',
    ],
  },
  {
    title: '3. How we use your information',
    body: null,
    list: [
      'Provide, operate, and maintain the Vidyank platform and your enrolled courses.',
      'Process purchases, subscriptions, and access to paid content.',
      'Sync learning progress across devices when you sign in.',
      'Send service-related notifications, updates, and support responses.',
      'Improve our courses, app performance, and user experience.',
      'Comply with applicable laws and protect against fraud or misuse.',
    ],
  },
  {
    title: '4. Sharing of information',
    body: 'We do not sell your personal information. We may share limited data with trusted service providers who help us operate the Services — such as cloud hosting, payment processing (e.g. PayU), and analytics — only to the extent necessary and under appropriate confidentiality obligations. We may also disclose information if required by law or to protect the rights and safety of Vidyank, our users, or others.',
  },
  {
    title: '5. Data retention',
    body: 'We retain your account and learning data for as long as your account is active or as needed to provide the Services. You may request deletion of your account by contacting us. Some information may be retained where required for legal, accounting, or security purposes.',
  },
  {
    title: '6. Security',
    body: 'We use reasonable technical and organisational measures to protect your information, including encrypted connections and secure storage for authentication tokens. No method of transmission over the internet is completely secure; we cannot guarantee absolute security.',
  },
  {
    title: '7. Children\'s privacy',
    body: 'Vidyank offers educational content for school students. If you are under 18, you should use the Services with the involvement and consent of a parent or guardian. We do not knowingly collect personal information from children without appropriate consent where required by law.',
  },
  {
    title: '8. Your rights',
    body: 'Depending on applicable law, you may have the right to access, correct, or delete your personal data, withdraw consent, or object to certain processing. To exercise these rights, contact us using the details below.',
  },
  {
    title: '9. Third-party links',
    body: 'Our Services may contain links to third-party websites or payment gateways. We are not responsible for the privacy practices of those external sites. We encourage you to review their privacy policies.',
  },
  {
    title: '10. Changes to this policy',
    body: 'We may update this Privacy Policy from time to time. The revised version will be posted on this page with an updated effective date. Continued use of the Services after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '11. Contact us',
    body: `If you have questions about this Privacy Policy or your data, contact us at:\n\n${companyInfo.name}\n${formatCompanyAddress()}\nEmail: support@vidyank.com\nPhone: +91 98765 43210`,
  },
]

export default function PrivacyPolicyPage() {
  const effectiveDate = 'June 18, 2026'

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Legal"
            title="Privacy Policy"
            subtitle={`Effective date: ${effectiveDate}`}
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
