import { getList, getJson } from '../lib/apiClient'
import { normalizeCategory, normalizeCourse } from '../utils/course'

let coursesCache = null
let coursesPromise = null
let categoriesCache = null
let categoriesPromise = null

export async function fetchPublishedCourses({ categoryId, forceRefresh = false } = {}) {
  if (!forceRefresh && !categoryId && coursesCache) {
    return coursesCache
  }

  const params = { published: 'true' }
  if (categoryId) params.category = categoryId

  const fetcher = async () => {
    const raw = await getList('/api/courses', params)
    return raw.map(normalizeCourse)
  }

  if (categoryId) {
    return fetcher()
  }

  if (!forceRefresh && coursesPromise) {
    return coursesPromise
  }

  coursesPromise = fetcher()
    .then((courses) => {
      coursesCache = courses
      return courses
    })
    .finally(() => {
      coursesPromise = null
    })

  return coursesPromise
}

export async function fetchPublishedCategories({ forceRefresh = false } = {}) {
  if (!forceRefresh && categoriesCache) {
    return categoriesCache
  }

  if (!forceRefresh && categoriesPromise) {
    return categoriesPromise
  }

  categoriesPromise = getList('/api/categories', { published: 'true' })
    .then((raw) => raw.map(normalizeCategory))
    .then((categories) => {
      categoriesCache = categories
      return categories
    })
    .finally(() => {
      categoriesPromise = null
    })

  return categoriesPromise
}

export async function fetchCourseById(id) {
  const json = await getJson(`/api/courses/${id}`)
  return normalizeCourse(json.data)
}

export async function fetchCourseFull(id) {
  const json = await getJson(`/api/courses/${id}/full`, { published: 'true' })
  return normalizeCourse(json.data)
}

export function invalidateCatalogCache() {
  coursesCache = null
  categoriesCache = null
}
