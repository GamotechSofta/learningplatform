export default function VideoPlayerModal({ video, onClose }) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-slate-900">{video.title}</h3>
            {video.description && (
              <p className="mt-1 text-sm text-slate-500">{video.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="bg-black">
          <video
            key={video.videoUrl}
            controls
            className="aspect-video w-full"
            poster={video.thumbnail || undefined}
          >
            <source src={video.videoUrl} />
            Your browser does not support video playback.
          </video>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500">
          <span>{video.duration > 0 ? `${video.duration}s` : "—"}</span>
          <span>{video.isPublished ? "Published" : "Draft"}</span>
        </div>
      </div>
    </div>
  );
}
