import { BookOpen } from 'lucide-react'
import { usePublishedCategories } from '../../hooks/usePublishedCategories'
import CategoryPathCard from './CategoryPathCard'

function CategorySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface animate-pulse">
      <div className="aspect-[16/10] bg-border-light" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded bg-border-light" />
        <div className="h-3 w-full rounded bg-border-light" />
        <div className="h-3 w-4/5 rounded bg-border-light" />
      </div>
    </div>
  )
}

export default function Categories() {
  const { categories, loading, error } = usePublishedCategories()

  return (
    <section className="border-b border-border bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Subjects &amp; Skills
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
            Browse by category
          </h2>
          <p className="mt-2 max-w-xl text-text-secondary">
            School boards, competitive exams, IT, cloud, and more — pick a field and start learning
            in the app.
          </p>
        </div>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryPathCard key={category.id} category={category} />
            ))}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="rounded-xl border border-border bg-surface py-14 text-center text-text-secondary">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-primary/40" />
            Categories will appear here once published.
          </div>
        )}
      </div>
    </section>
  )
}
