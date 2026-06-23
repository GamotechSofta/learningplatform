import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Loader2, Video } from 'lucide-react'
import Button from '../components/common/Button'
import CourseVideoList from '../components/courses/CourseVideoList'
import { useCatalogSync } from '../context/CatalogSyncContext'
import { fetchCourseFull } from '../services/catalogService'
import { PLACEHOLDER_THUMBNAIL } from '../utils/course'

export default function CourseDetailPage() {
  const { id } = useParams()
  const revisionTick = useCatalogSync()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [thumbError, setThumbError] = useState(false)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setThumbError(false)

    fetchCourseFull(id)
      .then((data) => {
        if (!cancelled) setCourse(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Course not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, revisionTick])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-text-primary">Course not found</h1>
        <p className="mt-2 text-text-secondary">{error}</p>
        <Button to="/courses" className="mt-6">
          Back to courses
        </Button>
      </div>
    )
  }

  const thumbnail =
    !thumbError && course.thumbnail ? course.thumbnail : PLACEHOLDER_THUMBNAIL
  const videoCount = course.videos?.length ?? course.videoCount ?? 0

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-primary-light lg:col-span-2">
            {thumbnail === PLACEHOLDER_THUMBNAIL ? (
              <div className="flex aspect-video items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary/40" />
              </div>
            ) : (
              <img
                src={thumbnail}
                alt={course.title}
                className="aspect-video w-full object-cover"
                onError={() => setThumbError(true)}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <CourseVideoList videos={course.videos ?? []} />
          </div>
        </div>

        <div className="mt-8">
          {course.categoryName && (
            <span className="mb-3 inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
              {course.categoryName}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">{course.title}</h1>
          <p className="mt-2 text-text-secondary">by {course.instructorName}</p>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-sm font-semibold text-primary">
            <Video className="h-4 w-4" />
            {videoCount} video{videoCount !== 1 ? 's' : ''}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-3 text-lg font-semibold text-text-primary">About this course</h2>
            <p className="whitespace-pre-line leading-relaxed text-text-secondary">
              {course.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
