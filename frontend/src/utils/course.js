import { courseRating, courseReviewCount } from './courseRating'

const PLACEHOLDER_THUMBNAIL =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
      <rect width="600" height="340" fill="#ecfdf5"/>
      <text x="300" y="180" text-anchor="middle" fill="#00bf63" font-family="system-ui" font-size="28" font-weight="600">Vidyank</text>
    </svg>`,
  )

export { PLACEHOLDER_THUMBNAIL }

export function getDisplayPrice(pricing = {}) {
  const { lifetime = 0, yearly = 0, monthly = 0, currency = 'INR' } = pricing

  if (lifetime > 0) {
    return { amount: lifetime, label: 'One-time purchase', isFree: false, currency }
  }
  if (yearly > 0) {
    return { amount: yearly, label: 'Per year', isFree: false, currency }
  }
  if (monthly > 0) {
    return { amount: monthly, label: 'Per month', isFree: false, currency }
  }

  return { amount: 0, label: 'Free course', isFree: true, currency }
}

export function formatPrice(amount, currency = 'INR') {
  if (amount <= 0) return 'Free'
  if (currency === 'INR') return `₹${Math.round(amount).toLocaleString('en-IN')}`
  return `${currency} ${Math.round(amount).toLocaleString()}`
}

export function normalizeCourse(raw) {
  const id = raw._id?.toString() ?? ''
  const category = raw.category
  const instructor = raw.instructor
  const pricing = raw.pricing ?? {}

  return {
    id,
    title: raw.title ?? 'Untitled',
    slug: raw.slug ?? '',
    description: raw.description ?? '',
    thumbnail: raw.thumbnail || null,
    categoryId: category?._id?.toString() ?? category?.toString() ?? null,
    categoryName: category?.name ?? null,
    level: raw.level ?? 'beginner',
    instructorName: instructor?.name ?? 'Vidyank Instructor',
    videoCount: raw.videoCount ?? 0,
    lessonCount: raw.lessons?.length ?? 0,
    pricing,
    displayPrice: getDisplayPrice(pricing),
    isPaid: raw.isPaid === true || getDisplayPrice(pricing).isFree === false,
    isPublished: raw.isPublished === true,
    rating: courseRating(id),
    reviewCount: courseReviewCount(id),
    tags: raw.tags ?? [],
  }
}

export function normalizeCategory(raw) {
  return {
    id: raw._id?.toString() ?? '',
    title: raw.name ?? 'Category',
    slug: raw.slug ?? '',
    description: raw.description ?? '',
    courseCount: raw.coursesCount ?? 0,
    thumbnail: raw.thumbnail ?? null,
  }
}
