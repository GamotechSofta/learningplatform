import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/25',
  inverse:
    'bg-white text-[#0f172a] hover:bg-slate-100 shadow-sm',
  secondary:
    'bg-primary-light text-primary border border-primary-tint-border hover:bg-primary-tint-border',
  outline:
    'bg-surface text-text-primary border border-border hover:border-primary hover:text-primary',
  ghost: 'text-text-secondary hover:text-primary hover:bg-primary-light',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }

  const { type = 'button', ...buttonProps } = props

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
