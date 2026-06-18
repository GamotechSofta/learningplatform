import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Video } from 'lucide-react'
import { PLACEHOLDER_THUMBNAIL } from '../../utils/course'

export default function CourseCard({ course }) {
  const [thumbError, setThumbError] = useState(false)
  const thumbnail = !thumbError && course.thumbnail ? course.thumbnail : PLACEHOLDER_THUMBNAIL
  const videoCount = course.videoCount ?? 0

  return (
    <Link
      to="/download"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="relative aspect-video overflow-hidden bg-primary-light">
        {thumbnail === PLACEHOLDER_THUMBNAIL ? (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-primary/40" strokeWidth={1.5} />
          </div>
        ) : (
          <img
            src={thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setThumbError(true)}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-text-primary group-hover:text-primary">
          {course.title}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
          <Video className="h-3 w-3" />
          {videoCount}
        </span>
      </div>
    </Link>
  )
}
