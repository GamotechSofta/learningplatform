import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SectionHeading from '../common/SectionHeading'
import CourseGrid from '../courses/CourseGrid'
import { usePublishedCourses } from '../../hooks/usePublishedCourses'

export default function PopularCourses() {
  const { courses, loading, error } = usePublishedCourses('all')
  const featured = courses.slice(0, 8)

  return (
    <section id="popular-courses" className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionHeading
              badge="Courses"
              title="Popular courses"
              subtitle="Hand-picked from our catalog — enroll and learn entirely through the mobile app."
              align="left"
              className="mb-0 lg:mb-0"
            />
          </div>
          <Link
            to="/courses"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            See all courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <CourseGrid
          courses={featured}
          loading={loading}
          error={error}
          emptyMessage="Courses will appear here once published."
        />
      </div>
    </section>
  )
}
