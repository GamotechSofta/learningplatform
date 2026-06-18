import { apiUrl } from '../config/api'

async function parseResponse(response) {
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message || `Request failed (${response.status})`)
  }

  return json
}

export async function getJson(path, params = {}) {
  const url = new URL(apiUrl(path), window.location.origin)

  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  const response = await fetch(url.toString())
  return parseResponse(response)
}

export async function getList(path, params = {}) {
  const json = await getJson(path, params)
  return json.data ?? []
}
