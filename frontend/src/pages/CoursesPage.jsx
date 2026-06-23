import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import CourseList from '../components/courses/CourseList'
import { usePublishedCourses } from '../hooks/usePublishedCourses'
import { usePublishedCategories } from '../hooks/usePublishedCategories'
import { getCategoryVisual } from '../utils/categoryVisuals'

function CategoryNavItem({ category, active, onClick }) {
  const { Icon, accent, iconBg } = getCategoryVisual(category)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-[border-color,background-color] duration-300 ${
        active
          ? 'border-primary/35 bg-primary/10'
          : 'border-transparent bg-transparent hover:border-border hover:bg-background'
      }`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-4 w-4 ${accent}`} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${active ? 'text-primary' : 'text-text-primary'}`}>
          {category.title}
        </p>
        <p className="text-xs text-text-secondary">
          {category.courseCount} course{category.courseCount !== 1 ? 's' : ''}
        </p>
      </div>
    </button>
  )
}

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('q') || ''

  const { courses, loading, error } = usePublishedCourses(activeCategory)
  const { categories, loading: categoriesLoading } = usePublishedCategories()

  const activeCategoryData = categories.find((c) => c.id === activeCategory)

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses

    const q = searchQuery.toLowerCase()
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructorName?.toLowerCase().includes(q) ||
        c.categoryName?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q),
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

  const totalCourses = categories.reduce((sum, c) => sum + (c.courseCount || 0), 0)

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="search"
              placeholder="Search courses, instructors, or topics..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm outline-none transition-[border-color,box-shadow] duration-300 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          {!loading && (
            <p className="text-sm text-text-secondary">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} shown
            </p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Categories
            </p>
            <div className="hidden rounded-2xl border border-border bg-surface lg:block">
              <div className="max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-y-contain p-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-[border-color,background-color] duration-300 ${
                    activeCategory === 'all'
                      ? 'border-primary/35 bg-primary/10'
                      : 'border-transparent hover:border-border hover:bg-background'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${activeCategory === 'all' ? 'text-primary' : 'text-text-primary'}`}>
                      All courses
                    </p>
                    <p className="text-xs text-text-secondary">{totalCourses} total</p>
                  </div>
                </button>

                {!categoriesLoading &&
                  categories.map((cat) => (
                    <CategoryNavItem
                      key={cat.id}
                      category={cat}
                      active={activeCategory === cat.id}
                      onClick={() => setCategory(cat.id)}
                    />
                  ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-text-primary">
                {activeCategoryData ? activeCategoryData.title : 'All courses'}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {activeCategoryData?.description ||
                  'Every published course across school, competitive exams, and professional skills.'}
              </p>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto overscroll-x-contain pb-2 scrollbar-thin lg:hidden">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'border border-border bg-surface text-text-secondary'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-primary text-white'
                      : 'border border-border bg-surface text-text-secondary'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            <CourseList
              courses={filteredCourses}
              loading={loading}
              error={error}
              emptyMessage="No courses match your search. Try a different category or keyword."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
