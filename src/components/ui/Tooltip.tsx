import { useId, useState, type PropsWithChildren, type ReactNode } from "react"

interface TooltipProps {
  content: ReactNode
  className?: string
}

/**
 * Lightweight hover/focus tooltip. Replaces native `title=""` (SourceBadge used
 * this before — inconsistent delay/styling across browsers, unstyleable).
 * No new dependency: plain absolute-positioned div, shown on hover AND focus
 * (so it's reachable via keyboard, not just mouse).
 */
export function Tooltip({ content, className = "", children }: PropsWithChildren<TooltipProps>) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? id : undefined}>{children}</span>
      {visible && (
        <span
          role="tooltip"
          id={id}
          className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-xs -translate-x-1/2 rounded-md border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 shadow-lg shadow-black/40"
        >
          {content}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  )
}
