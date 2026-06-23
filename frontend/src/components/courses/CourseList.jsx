import CourseListItem from './CourseListItem'
import CourseListItemSkeleton from './CourseListItemSkeleton'

export default function CourseList({ courses, loading, error, emptyMessage }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseListItemSkeleton key={i} />
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
      <div className="rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
        <p className="text-text-secondary">
          {emptyMessage || 'No courses available yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {courses.map((course) => (
        <CourseListItem key={course.id} course={course} />
      ))}
    </div>
  )
}
