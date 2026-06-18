import { Building2, GraduationCap, Heart, Target, Users } from 'lucide-react'
import SectionHeading from '../components/common/SectionHeading'
import CTABanner from '../components/home/CTABanner'
import { companyInfo, formatCompanyAddress } from '../config/company'

const values = [
  {
    icon: Target,
    title: 'Quality Education',
    description: 'Every course is crafted by experienced educators and industry professionals.',
  },
  {
    icon: Users,
    title: 'Accessible to All',
    description: 'Affordable pricing and mobile access so learning reaches every corner of India.',
  },
  {
    icon: Heart,
    title: 'Student First',
    description: 'We listen to learner feedback and continuously improve our platform.',
  },
  {
    icon: GraduationCap,
    title: 'Real Outcomes',
    description: 'Certificates, progress tracking, and exam-ready content that delivers results.',
  },
]

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="About"
            title="Empowering learners across India"
            subtitle="Vidyank is a modern learning platform built for school students, competitive exam aspirants, and professionals upskilling in technology."
          />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Our mission</h2>
              <p className="mt-4 leading-relaxed text-text-secondary">
                We believe quality education should not be limited by location or device. Vidyank
                brings expert-led video courses, structured learning paths, and verified
                certificates to your phone and browser — whether you are preparing for board exams,
                JEE, or building career skills in IT and cloud computing.
              </p>
              <p className="mt-4 leading-relaxed text-text-secondary">
                Founded with a vision to democratize learning in India, we partner with top
                educators to deliver content that is clear, engaging, and aligned with real exam
                and industry requirements.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <img
                src="https://images.unsplash.com/photo-1427504490245-70e615f617ee?w=800&h=500&fit=crop"
                alt="Students in a classroom"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="What we stand for" subtitle="The principles that guide everything we build." />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-border bg-background p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">{value.title}</h3>
                <p className="text-sm text-text-secondary">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Legal"
            title="Company information"
            subtitle="Vidyank is operated by the following registered entity."
          />

          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{companyInfo.name}</h3>
            </div>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-text-primary">Registered address</dt>
                <dd className="mt-1 leading-relaxed text-text-secondary">{formatCompanyAddress()}</dd>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-text-primary">CIN</dt>
                  <dd className="mt-1 text-text-secondary">{companyInfo.cin}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-primary">GST</dt>
                  <dd className="mt-1 text-text-secondary">{companyInfo.gst}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  )
}
