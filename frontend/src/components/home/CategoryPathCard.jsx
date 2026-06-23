import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getCategoryVisual } from '../../utils/categoryVisuals'

export default function CategoryPathCard({ category }) {
  const { Icon, accent, iconBg, hoverBg } = getCategoryVisual(category)

  return (
    <Link
      to={`/courses?category=${category.id}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-background px-4 py-4 transition-[border-color,background-color,padding] duration-300 hover:border-primary/35 hover:bg-primary/[0.03] hover:pl-5 sm:px-5 sm:py-5 sm:hover:pl-6"
    >
      <span
        aria-hidden
        className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {category.thumbnail ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
          <img
            src={category.thumbnail}
            alt=""
            className="h-full w-full object-cover transition-[filter,opacity] duration-300 group-hover:opacity-90 group-hover:saturate-110"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${iconBg} ${hoverBg}`}
        >
          <Icon className={`h-6 w-6 ${accent}`} strokeWidth={1.75} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-display text-base font-bold text-text-primary transition-colors duration-300 group-hover:text-primary">
            {category.title}
          </h3>
          <span className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary ring-1 ring-border transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/20">
            {category.courseCount} course{category.courseCount !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
          {category.description || 'Expert-led video courses with structured lessons.'}
        </p>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-text-secondary transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-primary"
        strokeWidth={2}
      />
    </Link>
  )
}
