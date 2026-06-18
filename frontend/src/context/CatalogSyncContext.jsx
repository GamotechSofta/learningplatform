import { createContext, useContext, useEffect, useState } from 'react'
import { startCatalogSync, subscribeCatalogSync } from '../services/catalogSyncService'

const CatalogSyncContext = createContext(0)

export function CatalogSyncProvider({ children }) {
  const [revisionTick, setRevisionTick] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeCatalogSync(() => {
      setRevisionTick((tick) => tick + 1)
    })
    const stop = startCatalogSync()
    return () => {
      unsubscribe()
      stop()
    }
  }, [])

  return (
    <CatalogSyncContext.Provider value={revisionTick}>{children}</CatalogSyncContext.Provider>
  )
}

export function useCatalogSync() {
  return useContext(CatalogSyncContext)
}
