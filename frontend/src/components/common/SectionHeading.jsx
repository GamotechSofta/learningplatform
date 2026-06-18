export default function SectionHeading({ badge, title, subtitle, align = 'center' }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center'

  return (
    <div className={`mb-12 ${alignClass}`}>
      {badge && (
        <span className="mb-3 inline-block rounded-full bg-primary-light px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {badge}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className={`mt-3 max-w-2xl text-text-secondary ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
