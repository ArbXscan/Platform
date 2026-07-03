import { useState } from "react"

function toLabel(dexId: string): string {
  const clean = dexId.replace(/[-_]/g, " ").trim()
  return (clean[0] ?? "?").toUpperCase()
}

interface DexLogoProps {
  dexId: string
  size?: number
  className?: string
}

/**
 * Two-tier fallback: local SVG asset (public/dex/{dexId}.svg) → neutral gray
 * monogram. Unlike ChainLogo, this does NOT color-code the fallback per DEX —
 * DexScreener's dexId list is open-ended and grows over time, so hardcoding a
 * color per DEX would mean guessing brand colors for many of them without
 * verifying against an official source, which is exactly what was flagged as
 * a problem. Neutral gray is used for every DEX until its real logo asset is
 * available; only the initial letter varies.
 */
export function DexLogo({ dexId, size = 20, className = "" }: DexLogoProps) {
  const [failed, setFailed] = useState(false)
  const dimension = { width: size, height: size }

  if (!failed) {
    return (
      <img
        src={`/dex/${dexId}.svg`}
        alt=""
        aria-hidden="true"
        style={dimension}
        className={`shrink-0 rounded-full bg-white/5 ${className}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-300 ${className}`}
      style={dimension}
      aria-hidden="true"
    >
      {toLabel(dexId)}
    </span>
  )
}
