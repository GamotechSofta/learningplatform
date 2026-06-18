import { getJson } from '../lib/apiClient'
import { invalidateCatalogCache } from './catalogService'

const POLL_MS = 30_000

let knownRevision = null
const listeners = new Set()

export function subscribeCatalogSync(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export async function fetchCatalogRevision() {
  const json = await getJson('/api/catalog/revision')
  return json.data?.revision ?? null
}

export async function checkCatalogRevision() {
  try {
    const revision = await fetchCatalogRevision()
    if (revision == null) return

    if (knownRevision !== null && revision !== knownRevision) {
      invalidateCatalogCache()
      notifyListeners()
    }

    knownRevision = revision
  } catch {
    // Ignore transient network errors; next poll will retry.
  }
}

export function startCatalogSync() {
  checkCatalogRevision()

  const intervalId = window.setInterval(checkCatalogRevision, POLL_MS)

  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      checkCatalogRevision()
    }
  }

  window.addEventListener('focus', checkCatalogRevision)
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    window.clearInterval(intervalId)
    window.removeEventListener('focus', checkCatalogRevision)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
