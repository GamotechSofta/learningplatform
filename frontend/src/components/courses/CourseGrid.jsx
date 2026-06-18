import CourseCard from './CourseCard'
import CourseCardSkeleton from './CourseCardSkeleton'

export default function CourseGrid({ courses, loading, error, emptyMessage }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-12 text-center">
        <p className="font-medium text-red-400">Could not load courses</p>
        <p className="mt-2 text-sm text-red-400/80">{error}</p>
      </div>
    )
  }

  if (!courses.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface py-16 text-center">
        <p className="text-text-secondary">
          {emptyMessage || 'No courses available yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
