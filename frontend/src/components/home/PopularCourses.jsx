import SectionHeading from '../common/SectionHeading'
import CourseGrid from '../courses/CourseGrid'
import { usePublishedCourses } from '../../hooks/usePublishedCourses'

export default function PopularCourses() {
  const { courses, loading, error } = usePublishedCourses('all')
  const featured = courses.slice(0, 8)

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionHeading
            badge="Courses"
            title="All published courses"
            subtitle="Every course available on Vidyank — enroll via the mobile app."
            align="left"
          />
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
