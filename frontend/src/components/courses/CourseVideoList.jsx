import { useState } from 'react'
import { Lock, Play, Video } from 'lucide-react'
import DownloadAppModal from './DownloadAppModal'
import { formatDuration, LOCKED_VIDEO_THUMBNAIL, PLACEHOLDER_THUMBNAIL } from '../../utils/course'

function VideoThumb({ video }) {
  const [thumbError, setThumbError] = useState(false)

  if (video.isLocked) {
    return (
      <>
        <img
          src={LOCKED_VIDEO_THUMBNAIL}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute inset-0 bg-black/15" aria-hidden />
      </>
    )
  }

  const src = !thumbError && video.thumbnail ? video.thumbnail : PLACEHOLDER_THUMBNAIL

  if (src === PLACEHOLDER_THUMBNAIL) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary-light">
        <Video className="h-5 w-5 text-primary/40" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      onError={() => setThumbError(true)}
    />
  )
}

export default function CourseVideoList({ videos }) {
  const [selectedVideo, setSelectedVideo] = useState(null)

  if (!videos.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm text-text-secondary">
        No videos published for this course yet.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-display text-sm font-bold text-text-primary">Course videos</h2>
          <p className="mt-0.5 text-xs text-text-secondary">{videos.length} lessons — watch in the app</p>
        </div>

        <div className="max-h-[min(520px,calc(100vh-10rem))] overflow-y-auto overscroll-y-contain scrollbar-thin">
          {videos.map((video, index) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setSelectedVideo(video)}
              className="group flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left transition-[background-color,border-color] duration-300 last:border-b-0 hover:bg-primary/[0.03]"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-primary-light">
                <VideoThumb video={video} />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
                    {video.isLocked ? (
                      <Lock className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 fill-white text-white" />
                    )}
                  </span>
                </span>
                {!video.isLocked && (
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-text-secondary">
                  Lesson {index + 1}
                  {video.lessonTitle ? ` · ${video.lessonTitle}` : ''}
                </p>
                <p
                  className={`mt-0.5 line-clamp-2 text-sm font-semibold transition-colors duration-300 group-hover:text-primary ${
                    video.isLocked ? 'text-text-secondary' : 'text-text-primary'
                  }`}
                >
                  {video.title}
                </p>
                {video.isLocked && (
                  <span className="mt-1 inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary ring-1 ring-border">
                    Locked
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <DownloadAppModal
        open={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        videoTitle={selectedVideo?.title}
      />
    </>
  )
}
