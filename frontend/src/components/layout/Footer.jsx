import { Link } from 'react-router-dom'
import { Building2, Mail, MapPin, Phone } from 'lucide-react'
import Logo from '../common/Logo'
import { companyInfo, formatCompanyAddress } from '../../config/company'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex">
              <Logo />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Learn smarter with expert-led courses for school, competitive exams, and professional
              skills — on web and mobile.
            </p>
            <Link
              to="/download"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Download the app
            </Link>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-primary">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{companyInfo.name}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{formatCompanyAddress()}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-primary">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                support@vidyank.com
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                +91 98765 43210
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-xs leading-relaxed text-text-secondary sm:text-left">
            CIN: {companyInfo.cin} &nbsp;|&nbsp; GST: {companyInfo.gst}
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} Vidyank. All rights reserved.
          </p>
          <Link to="/privacy" className="text-sm text-text-secondary hover:text-primary">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
