import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { getCategoryVisual } from '../../utils/categoryVisuals'

export default function CategoryPathCard({ category }) {
  const { Icon } = getCategoryVisual(category)

  return (
    <Link
      to="/download"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
    >
      {/* Thumbnail — fixed ratio, consistent crop */}
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-primary-light">
        {category.thumbnail ? (
          <img
            src={category.thumbnail}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="h-10 w-10 text-primary/30" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Content — fixed structure so every card aligns */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-base font-semibold text-text-primary group-hover:text-primary">
          {category.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-text-secondary">
          {category.description || 'Expert-led video courses with structured lessons.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs font-medium text-text-secondary">
            {category.courseCount} course{category.courseCount !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
