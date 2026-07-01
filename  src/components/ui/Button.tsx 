import type { ButtonHTMLAttributes, PropsWithChildren } from "react"
import { Link } from "react-router-dom"
import { scrollToHash } from "../../utils/scroll"

type Variant = "primary" | "secondary" | "ghost"
type Size = "sm" | "md" | "lg"

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  /** "#section" => in-page scroll, "/route" => router link, "https://" => external */
  href?: string
  external?: boolean
  className?: string
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:opacity-50 disabled:cursor-not-allowed"

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 hover:-translate-y-0.5",
  secondary:
    "border border-white/15 bg-white/5 text-white backdrop-blur hover:border-cyan-400/40 hover:bg-white/10",
  ghost: "text-slate-300 hover:text-white",
}

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
}

type Props = PropsWithChildren<
  ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>
>

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  external,
  className = "",
  onClick,
  ...rest
}: Props) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  // In-page anchor → smooth scroll
  if (href?.startsWith("#")) {
    return (
      <a
        href={href}
        className={classes}
        onClick={(e) => {
          e.preventDefault()
          scrollToHash(href)
        }}
      >
        {children}
      </a>
    )
  }

  // External link
  if (href && (external || href.startsWith("http"))) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }

  // Internal route
  if (href) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    )
  }

  // Plain button
  return (
    <button type="button" className={classes} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
