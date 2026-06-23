import { ArrowRight, BookOpen, ChevronRight, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublishedCategories } from '../../hooks/usePublishedCategories'
import CategoryPathCard from './CategoryPathCard'
import Button from '../common/Button'

const INITIAL_VISIBLE = 5

function CategorySkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-xl border border-border bg-background px-5 py-5">
      <div className="h-14 w-14 shrink-0 rounded-xl bg-border-light" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-border-light" />
        <div className="h-3 w-full rounded bg-border-light" />
        <div className="h-3 w-4/5 rounded bg-border-light" />
      </div>
    </div>
  )
}

export default function Categories() {
  const { categories, loading, error } = usePublishedCategories()
  const totalCourses = categories.reduce((sum, c) => sum + (c.courseCount || 0), 0)
  const hasMore = categories.length > INITIAL_VISIBLE
  const visibleCategories = categories.slice(0, INITIAL_VISIBLE)
  const hiddenCount = Math.max(categories.length - INITIAL_VISIBLE, 0)

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 lg:py-24">
      <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-gradient-to-l from-primary/[0.04] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Subjects &amp; Skills
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              From school fundamentals to JEE and professional IT — choose a learning path and explore
              the full catalog.
            </p>

            {!loading && categories.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-text-primary">{categories.length}</span>
                  <span className="text-text-secondary">categories</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-text-primary">{totalCourses}</span>
                  <span className="text-text-secondary">courses</span>
                </div>
              </div>
            )}

            <div className="mt-8">
              <Button to="/courses" variant="secondary" className="rounded-full">
                View full catalog
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CategorySkeleton key={i} />
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-center text-red-400">
                Could not load categories
              </div>
            )}

            {!loading && !error && categories.length > 0 && (
              <div className="space-y-3">
                {visibleCategories.map((category) => (
                  <CategoryPathCard key={category.id} category={category} />
                ))}

                {hasMore && (
                  <div className="pt-2">
                    <Link
                      to="/courses"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition-[border-color,background-color,color] duration-300 hover:border-primary/35 hover:bg-primary/[0.03] hover:text-primary"
                    >
                      Show {hiddenCount} more categor{hiddenCount === 1 ? 'y' : 'ies'}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && categories.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-surface py-16 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-primary/40" />
                <p className="text-text-secondary">Categories will appear here once published.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
