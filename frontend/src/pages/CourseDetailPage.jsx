import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Loader2, Video } from 'lucide-react'
import Button from '../components/common/Button'
import { useCatalogSync } from '../context/CatalogSyncContext'
import { fetchCourseById } from '../services/catalogService'
import { formatPrice, PLACEHOLDER_THUMBNAIL } from '../utils/course'

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

    fetchCourseById(id)
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

  const priceLabel = course.displayPrice?.isFree
    ? 'Free'
    : formatPrice(course.displayPrice?.amount, course.displayPrice?.currency)

  const thumbnail =
    !thumbError && course.thumbnail ? course.thumbnail : PLACEHOLDER_THUMBNAIL
  const videoCount = course.videoCount ?? 0

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

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-primary-light">
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

            <div className="mt-8">
              {course.categoryName && (
                <span className="mb-3 inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                  {course.categoryName}
                </span>
              )}
              <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">{course.title}</h1>
              <p className="mt-2 text-text-secondary">by {course.instructorName}</p>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-sm font-semibold text-primary">
                <Video className="h-4 w-4" />
                {videoCount} video{videoCount !== 1 ? 's' : ''}
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
                <h2 className="mb-3 text-lg font-semibold text-text-primary">About this course</h2>
                <p className="leading-relaxed text-text-secondary whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-lg shadow-primary/5">
              <div className="mb-1 text-3xl font-bold text-text-primary">{priceLabel}</div>
              <p className="mb-6 text-sm text-text-secondary">{course.displayPrice?.label}</p>

              <Button to="/download" className="w-full" size="lg">
                Get App to Enroll
              </Button>
              <Button to="/courses" variant="secondary" className="mt-3 w-full" size="lg">
                Browse More Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
