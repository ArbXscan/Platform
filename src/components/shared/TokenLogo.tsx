import { useState } from "react"

interface TokenLogoProps {
  logoUrl?: string
  symbol: string
  size?: number
  className?: string
}

/**
 * Unlike ChainLogo/DexLogo, token logos ARE real data already — DexScreener's
 * pair payload includes info.imageUrl (see services/providers/dexscreener.ts),
 * already wired through features/token/token.service.ts and
 * features/arbitrage/arbitrage.service.ts as `logoUrl`. This component just
 * renders it properly with a graceful fallback, no invented data involved.
 */
export function TokenLogo({ logoUrl, symbol, size = 28, className = "" }: TokenLogoProps) {
  const [failed, setFailed] = useState(false)
  const dimension = { width: size, height: size }

  if (!logoUrl || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-300 ${className}`}
        style={dimension}
        aria-hidden="true"
      >
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={logoUrl}
      alt={`${symbol} logo`}
      style={dimension}
      className={`shrink-0 rounded-full bg-white/5 object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
