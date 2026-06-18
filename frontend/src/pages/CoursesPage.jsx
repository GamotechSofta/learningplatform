import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import CourseGrid from '../components/courses/CourseGrid'
import SectionHeading from '../components/common/SectionHeading'
import { usePublishedCourses } from '../hooks/usePublishedCourses'
import { usePublishedCategories } from '../hooks/usePublishedCategories'

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('q') || ''

  const { courses, loading, error } = usePublishedCourses(activeCategory)
  const { categories } = usePublishedCategories()

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses

    const q = searchQuery.toLowerCase()
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructorName?.toLowerCase().includes(q) ||
        c.categoryName?.toLowerCase().includes(q),
    )
  }, [courses, searchQuery])

  function setCategory(id) {
    const params = new URLSearchParams(searchParams)
    if (id === 'all') {
      params.delete('category')
    } else {
      params.set('category', id)
    }
    setSearchParams(params)
  }

  function handleSearch(e) {
    const value = e.target.value
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    setSearchParams(params)
  }

  return (
    <div className="bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Courses"
          title="Explore all courses"
          subtitle="Browse every published course from Vidyank — same catalog as the mobile app."
        />

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="search"
              placeholder="Search courses or instructors..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <p className="text-sm text-text-secondary">
            {!loading && (
              <>
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </>
            )}
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-primary-light hover:text-primary'
            }`}
          >
            All courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:bg-primary-light hover:text-primary'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        <CourseGrid
          courses={filteredCourses}
          loading={loading}
          error={error}
          emptyMessage="No courses match your search. Try a different filter."
        />
      </div>
    </div>
  )
}
