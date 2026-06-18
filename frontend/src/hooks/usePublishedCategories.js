import { useEffect, useState } from 'react'
import { useCatalogSync } from '../context/CatalogSyncContext'
import { fetchPublishedCategories } from '../services/catalogService'

export function usePublishedCategories() {
  const revisionTick = useCatalogSync()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    fetchPublishedCategories({ forceRefresh: revisionTick > 0 })
      .then((data) => {
        if (!cancelled) setCategories(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load categories')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [revisionTick])

  return { categories, loading, error }
}
