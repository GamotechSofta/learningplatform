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
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-[border-color,background-color] duration-300 hover:border-primary/35 hover:bg-primary/[0.03]"
    >
      <div className="relative aspect-video overflow-hidden bg-primary-light">
        {thumbnail === PLACEHOLDER_THUMBNAIL ? (
          <div className="flex h-full items-center justify-center transition-colors duration-300 group-hover:bg-primary/10">
            <BookOpen className="h-10 w-10 text-primary/40 transition-colors duration-300 group-hover:text-primary/60" />
          </div>
        ) : (
          <>
            <img
              src={thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-[filter,opacity] duration-300 group-hover:opacity-90 group-hover:saturate-110"
              loading="lazy"
              onError={() => setThumbError(true)}
            />
            <div className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10" />
          </>
        )}
        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-[width] duration-300 group-hover:w-full" />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 transition-colors duration-300 group-hover:border-primary/20">
        <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-text-primary transition-colors duration-300 group-hover:text-primary">
          {course.title}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
          <Video className="h-3 w-3" />
          {videoCount}
        </span>
      </div>
    </Link>
  )
}
