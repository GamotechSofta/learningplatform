import { useEffect, useState } from 'react'
import { useCatalogSync } from '../context/CatalogSyncContext'
import { fetchPublishedCourses } from '../services/catalogService'

export function usePublishedCourses(categoryId) {
  const revisionTick = useCatalogSync()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    const forceRefresh = revisionTick > 0

    fetchPublishedCourses({
      categoryId: categoryId === 'all' ? undefined : categoryId,
      forceRefresh,
    })
      .then((data) => {
        if (!cancelled) setCourses(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load courses')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categoryId, revisionTick])

  return { courses, loading, error }
}
