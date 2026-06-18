import { Star } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'

const testimonials = [
  {
    name: 'Rahul M.',
    role: 'JEE Aspirant, Pune',
    quote:
      'The Physics course helped me jump from 60% to 92% in mock tests. Clear explanations and great problem sets.',
    rating: 5,
  },
  {
    name: 'Sneha K.',
    role: 'Class 10 Student',
    quote:
      'Math was always tough for me, but Vidyank made it simple. I love watching lessons on my phone during commute.',
    rating: 5,
  },
  {
    name: 'Amit T.',
    role: 'IT Professional',
    quote:
      'Completed AWS certification prep here. The structured modules and quizzes kept me on track despite a busy schedule.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Testimonials"
          title="Loved by learners across India"
          subtitle="Join thousands of students who are achieving their goals with Vidyank."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent-gold text-accent-gold" />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-text-secondary">&ldquo;{item.quote}&rdquo;</p>
              <div>
                <div className="font-semibold text-text-primary">{item.name}</div>
                <div className="text-sm text-text-secondary">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
