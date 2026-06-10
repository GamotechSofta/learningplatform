export default function LessonDetailModal({ lesson, courseTitle, onClose, onViewVideos }) {
  if (!lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">Lesson Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Course</p>
            <p className="text-sm text-slate-800">{courseTitle}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Title</p>
            <p className="text-sm font-medium text-slate-900">{lesson.title}</p>
          </div>
          {lesson.description && (
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Description</p>
              <p className="text-sm text-slate-600">{lesson.description}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {lesson.isFree && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-700">
                Free preview
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                lesson.isPublished
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {lesson.isPublished ? "Published" : "Draft"}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
              Order: {lesson.order + 1}
            </span>
          </div>
          {lesson.videos?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-slate-400">Videos</p>
              <ul className="space-y-1 text-sm text-slate-600">
                {lesson.videos.map((v) => (
                  <li key={v._id}>• {v.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          {onViewVideos && (
            <button
              type="button"
              onClick={onViewVideos}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Manage Videos
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
