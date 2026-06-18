import { Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AppDownloadButton({ variant = 'default', className = '', onClick }) {
  if (variant === 'navbar') {
    return (
      <Link
        to="/download"
        onClick={onClick}
        className={`inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark ${className}`}
      >
        <Smartphone className="h-4 w-4" />
        Get the App
      </Link>
    )
  }

  return (
    <Link
      to="/download"
      className={`inline-flex items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-3.5 text-text-primary shadow-sm transition-all hover:bg-surface-elevated ${className}`}
    >
      <Smartphone className="h-5 w-5 text-primary" />
      <div className="text-left">
        <div className="text-[10px] uppercase tracking-wider text-text-secondary">Download on</div>
        <div className="text-sm font-semibold text-text-primary">Google Play & App Store</div>
      </div>
    </Link>
  )
}
