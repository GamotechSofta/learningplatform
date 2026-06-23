import { Smartphone, X } from 'lucide-react'
import Button from '../common/Button'

export default function DownloadAppModal({ open, onClose, videoTitle }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-app-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-border-light hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>

        <h3 id="download-app-title" className="font-display text-xl font-bold text-text-primary">
          Download the Vidyank app
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {videoTitle ? (
            <>
              To watch <span className="font-medium text-text-primary">&ldquo;{videoTitle}&rdquo;</span>,
              install the app and enroll in this course.
            </>
          ) : (
            'Install the Vidyank app to watch lessons, track progress, and enroll in courses.'
          )}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button to="/download" className="flex-1 rounded-full" onClick={onClose}>
            Download app
          </Button>
          <Button variant="outline" className="flex-1 rounded-full" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  )
}
