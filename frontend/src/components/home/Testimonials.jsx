import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'

const testimonials = [
  {
    name: 'Rahul M.',
    role: 'JEE Aspirant, Pune',
    initials: 'RM',
    quote:
      'The Physics course helped me jump from 60% to 92% in mock tests. Clear explanations and great problem sets.',
    rating: 5,
    accent: 'from-emerald-500/20 to-primary/5',
  },
  {
    name: 'Sneha K.',
    role: 'Class 10 Student, Mumbai',
    initials: 'SK',
    quote:
      'Math was always tough for me, but Vidyank made it simple. I love watching lessons on my phone during my commute.',
    rating: 5,
    accent: 'from-sky-500/20 to-primary/5',
  },
  {
    name: 'Amit T.',
    role: 'IT Professional, Bengaluru',
    initials: 'AT',
    quote:
      'Completed AWS certification prep here. The structured modules and quizzes kept me on track despite a busy schedule.',
    rating: 5,
    accent: 'from-amber-500/20 to-primary/5',
  },
  {
    name: 'Priya S.',
    role: 'Class 12 Student, Delhi',
    initials: 'PS',
    quote:
      'Chemistry chapters finally made sense. The topic-wise breakdown matches my board syllabus perfectly.',
    rating: 5,
    accent: 'from-violet-500/20 to-primary/5',
  },
  {
    name: 'Vikram D.',
    role: 'NEET Aspirant, Hyderabad',
    initials: 'VD',
    quote:
      'Biology videos with diagrams are excellent. I revise daily and my mock scores have improved steadily.',
    rating: 5,
    accent: 'from-rose-500/20 to-primary/5',
  },
  {
    name: 'Ananya R.',
    role: 'Parent, Chennai',
    initials: 'AR',
    quote:
      'My daughter uses Vidyank for school subjects. The progress tracking helps me see what she has completed.',
    rating: 5,
    accent: 'from-cyan-500/20 to-primary/5',
  },
  {
    name: 'Karthik N.',
    role: 'B.Tech Student, Coimbatore',
    initials: 'KN',
    quote:
      'Operating systems and networking courses are well structured. Perfect supplement to my college lectures.',
    rating: 5,
    accent: 'from-indigo-500/20 to-primary/5',
  },
  {
    name: 'Meera P.',
    role: 'Working Professional, Jaipur',
    initials: 'MP',
    quote:
      'Upskilling after work is easier with offline downloads. I finish one lesson every night without distractions.',
    rating: 5,
    accent: 'from-orange-500/20 to-primary/5',
  },
  {
    name: 'Rohan G.',
    role: 'Class 9 Student, Nagpur',
    initials: 'RG',
    quote:
      'Science experiments explained on video are so much better than just reading the textbook. Highly recommend Vidyank.',
    rating: 5,
    accent: 'from-lime-500/20 to-primary/5',
  },
]

function TestimonialCard({ item }) {
  return (
    <article className="relative flex h-full w-[min(100%,300px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-background p-6 transition-[border-color,background-color] duration-300 hover:border-primary/35 hover:bg-primary/[0.03] sm:w-[340px] sm:p-7">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${item.accent} to-transparent`} />
      <Quote className="relative mb-4 h-7 w-7 text-primary/40" />
      <div className="relative mb-4 flex gap-0.5">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-accent-gold text-accent-gold" />
        ))}
      </div>
      <p className="relative mb-8 flex-1 text-sm leading-relaxed text-text-secondary">
        &ldquo;{item.quote}&rdquo;
      </p>
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
          {item.initials}
        </div>
        <div>
          <div className="font-semibold text-text-primary">{item.name}</div>
          <div className="text-sm text-text-secondary">{item.role}</div>
        </div>
      </div>
    </article>
  )
}

export default function Testimonials() {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4)

    const cards = el.querySelectorAll('article')
    if (!cards.length) return

    let closest = 0
    let minDistance = Infinity
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - scrollLeft)
      if (distance < minDistance) {
        minDistance = distance
        closest = index
      }
    })
    setActiveIndex(closest)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  const scrollByCard = (direction) => {
    const el = scrollRef.current
    if (!el) return

    const card = el.querySelector('article')
    const gap = 16
    const amount = card ? card.offsetWidth + gap : 340
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  const scrollToIndex = (index) => {
    const el = scrollRef.current
    if (!el) return

    const card = el.querySelectorAll('article')[index]
    if (card) {
      el.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
    }
  }

  return (
    <section className="border-y border-border bg-surface py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionHeading
              badge="Testimonials"
              title="Loved by learners across India"
              subtitle="Real stories from students and professionals who leveled up with Vidyank."
              align="left"
              className="mb-0 lg:mb-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              aria-label="Previous testimonial"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-text-primary transition-[border-color,background-color,color] duration-300 hover:border-primary/35 hover:bg-primary/[0.03] hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              aria-label="Next testimonial"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-text-primary transition-[border-color,background-color,color] duration-300 hover:border-primary/35 hover:bg-primary/[0.03] hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {testimonials.map((item) => (
              <TestimonialCard key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-primary/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
