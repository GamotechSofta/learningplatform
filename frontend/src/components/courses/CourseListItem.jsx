import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Star, Video } from 'lucide-react'
import { formatPrice, PLACEHOLDER_THUMBNAIL } from '../../utils/course'
import { formatReviewCount } from '../../utils/courseRating'

function formatLevel(level) {
  if (!level) return 'All levels'
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export default function CourseListItem({ course }) {
  const [thumbError, setThumbError] = useState(false)
  const thumbnail = !thumbError && course.thumbnail ? course.thumbnail : PLACEHOLDER_THUMBNAIL
  const priceLabel = course.displayPrice?.isFree
    ? 'Free'
    : formatPrice(course.displayPrice?.amount, course.displayPrice?.currency)

  return (
    <article className="group relative border-b border-border transition-[background-color,border-color] duration-300 last:border-b-0 hover:bg-primary/[0.02]">
      <Link
        to={`/courses/${course.id}`}
        className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5"
      >
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-primary-light sm:h-[4.25rem] sm:w-28">
          {thumbnail === PLACEHOLDER_THUMBNAIL ? (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary/35" strokeWidth={1.5} />
            </div>
          ) : (
            <img
              src={thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-[filter,opacity] duration-300 group-hover:opacity-95"
              loading="lazy"
              onError={() => setThumbError(true)}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {course.categoryName && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {course.categoryName}
              </span>
            )}
            <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-secondary ring-1 ring-border">
              {formatLevel(course.level)}
            </span>
          </div>

          <h3 className="mt-1 line-clamp-1 font-display text-sm font-bold text-text-primary transition-colors duration-300 group-hover:text-primary sm:text-base">
            {course.title}
          </h3>

          <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
            by {course.instructorName}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
              <span className="font-medium text-text-primary">{course.rating?.toFixed(1)}</span>
              <span>({formatReviewCount(course.reviewCount)})</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Video className="h-3 w-3 text-primary" />
              {course.videoCount} lessons
            </span>
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <p className="font-display text-base font-bold text-text-primary">{priceLabel}</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-[gap] duration-300 group-hover:gap-1.5">
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary transition-colors duration-300 group-hover:text-primary sm:hidden" />
      </Link>
    </article>
  )
}
