// Defaults to production API so `npm run dev` works without a local backend.
// For local backend: set VITE_API_URL=http://127.0.0.1:3000 in .env.local
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.vidyank.com'
export function apiUrl(path) {
  return `${API_BASE}${path}`
}
