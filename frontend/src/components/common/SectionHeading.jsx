export default function SectionHeading({ badge, title, subtitle, align = 'center', className = '' }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center'
  const subtitleClass = align === 'center' ? 'mx-auto' : ''

  return (
    <div className={`mb-12 lg:mb-14 ${alignClass} ${className}`}>
      {badge && (
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {badge}
        </span>
      )}
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 max-w-2xl text-base leading-relaxed text-text-secondary ${subtitleClass}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
