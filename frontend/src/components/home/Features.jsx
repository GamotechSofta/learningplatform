import { BookOpen, Award, Smartphone, Video } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'

const features = [
  {
    icon: Video,
    title: 'HD Video Lessons',
    description: 'Crystal-clear lectures from expert educators, available offline in the app.',
  },
  {
    icon: BookOpen,
    title: 'Structured Curriculum',
    description: 'Courses aligned with boards, JEE syllabus, and industry certifications.',
  },
  {
    icon: Award,
    title: 'Verified Certificates',
    description: 'Earn shareable certificates when you complete a course.',
  },
  {
    icon: Smartphone,
    title: 'Learn on Mobile',
    description: 'Download the Vidyank app and continue learning on the go.',
  },
]

export default function Features() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Why Vidyank"
          title="Everything you need to succeed"
          subtitle="A complete learning experience designed for Indian students and professionals."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary-tint-border hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light transition-colors group-hover:bg-primary">
                <feature.icon className="h-6 w-6 text-primary transition-colors group-hover:text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
