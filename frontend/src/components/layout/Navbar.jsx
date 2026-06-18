import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import AppDownloadButton from '../common/AppDownloadButton'
import ThemeToggle from '../common/ThemeToggle'
import Logo from '../common/Logo'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <AppDownloadButton variant="navbar" />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg p-2 text-text-secondary hover:bg-border-light"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <AppDownloadButton
            variant="navbar"
            className="w-full justify-center"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </header>
  )
}
