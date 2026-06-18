export function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

export function courseRating(courseId) {
  if (!courseId) return 4.5
  const step = hashString(courseId) % 11
  return 4.0 + step / 10
}

export function courseReviewCount(courseId) {
  if (!courseId) return 120
  return 95 + (hashString(`${courseId}_reviews`) % 2891)
}

export function formatReviewCount(count) {
  if (count >= 1000) {
    const k = count / 1000
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1)}k`
  }
  return String(count)
}
