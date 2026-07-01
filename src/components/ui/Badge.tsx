import type { PropsWithChildren } from "react"

export function Badge({ children }: PropsWithChildren) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium tracking-wide text-cyan-300">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
      {children}
    </span>
  )
}
