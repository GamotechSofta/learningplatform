export default function UploadCompleteModal({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-complete-title"
      >
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
            ✓
          </div>
          <h3 id="upload-complete-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h3>
          {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
