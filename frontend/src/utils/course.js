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

export const LOCKED_VIDEO_THUMBNAIL = '/blureBanner.png'

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

export function formatDuration(seconds) {
  const total = Number(seconds) || 0
  if (total <= 0) return '—'
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = Math.floor(total % 60)
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

function normalizeLessonVideo(video) {
  return {
    id: video._id?.toString() ?? '',
    title: video.title ?? 'Untitled video',
    duration: video.duration ?? 0,
    thumbnail: video.thumbnail || null,
    isLocked: video.isLocked === true,
    order: video.order ?? 0,
  }
}

function applyWebPlaybackLocks(course, raw) {
  const hasFullAccess =
    !course.isPaid || raw.hasAccess === true || raw.hasPurchased === true

  if (hasFullAccess) {
    return course
  }

  const lockVideo = (video, locked) => ({
    ...video,
    isLocked: locked,
    thumbnail: locked ? null : video.thumbnail,
  })

  if (course.videos.some((video) => video.isLocked)) {
    return {
      ...course,
      videos: course.videos.map((video) => lockVideo(video, video.isLocked)),
      lessons: course.lessons.map((lesson) => ({
        ...lesson,
        videos: lesson.videos.map((video) => lockVideo(video, video.isLocked)),
      })),
    }
  }

  let previewGranted = false
  const videos = course.videos.map((video) => {
    if (!previewGranted) {
      previewGranted = true
      return lockVideo(video, false)
    }
    return lockVideo(video, true)
  })

  let lessonPreviewGranted = false
  const lessons = course.lessons.map((lesson) => ({
    ...lesson,
    videos: lesson.videos.map((video) => {
      if (!lessonPreviewGranted) {
        lessonPreviewGranted = true
        return lockVideo(video, false)
      }
      return lockVideo(video, true)
    }),
  }))

  return { ...course, videos, lessons }
}

export function normalizeCourseFull(raw) {
  const base = normalizeCourse(raw)
  const lessons = (raw.lessons || []).map((lesson) => {
    const lessonId = lesson._id?.toString() ?? ''
    const videos = (lesson.videos || []).map(normalizeLessonVideo).sort((a, b) => a.order - b.order)

    return {
      id: lessonId,
      title: lesson.title ?? 'Lesson',
      order: lesson.order ?? 0,
      videos,
    }
  })

  const videos = lessons
    .flatMap((lesson) =>
      lesson.videos.map((video) => ({
        ...video,
        lessonTitle: lesson.title,
      })),
    )
    .sort((a, b) => a.order - b.order)

  return applyWebPlaybackLocks(
    {
      ...base,
      lessons,
      videos,
      videoCount: videos.length || base.videoCount,
    },
    raw,
  )
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
