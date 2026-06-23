import SectionHeading from '../components/common/SectionHeading'
import { payuInfoTable, payuPrivacySections } from '../content/payuPrivacyPolicy'

function PolicyBody({ text }) {
  return (
    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
      {text}
    </p>
  )
}

function PolicyList({ items }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function InfoTable() {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-text-primary">
              Categories of Personal Information
            </th>
            <th className="px-4 py-3 text-left font-semibold text-text-primary">
              Which includes information such as:
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {payuInfoTable.map((row) => (
            <tr key={row.category}>
              <td className="px-4 py-3 align-top font-medium text-text-primary">{row.category}</td>
              <td className="px-4 py-3 align-top text-text-secondary">{row.examples}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Subsection({ subsection }) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-text-primary">{subsection.title}</h3>
      {subsection.body && <PolicyBody text={subsection.body} />}
      {subsection.list && <PolicyList items={subsection.list} />}
    </div>
  )
}

function PolicySection({ section }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
      {section.body && <PolicyBody text={section.body} />}
      {section.showInfoTable && <InfoTable />}
      {section.bodyAfter && <PolicyBody text={section.bodyAfter} />}
      {section.list && <PolicyList items={section.list} />}
      {section.subsections?.map((subsection) => (
        <Subsection key={subsection.title} subsection={subsection} />
      ))}
    </div>
  )
}

export default function PaymentPrivacyPolicyPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Legal"
            title="Payment Privacy Policy"
            subtitle="Payments on Vidyank are processed by PayU Payments Private Limited. The following PayU Payments Privacy Statement applies to payment transactions."
            align="left"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {payuPrivacySections.map((section) => (
              <PolicySection key={section.title} section={section} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
