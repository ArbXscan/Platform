import { useState } from "react"

interface ChainStyle {
  label: string
  className: string
}

/**
 * Official brand colors per chain (publicly documented, stable) — used only for
 * the final monogram fallback tier, never as the primary representation.
 */
const CHAIN_STYLES: Record<string, ChainStyle> = {
  ethereum: { label: "E", className: "bg-[#627EEA] text-white" },
  solana: { label: "S", className: "bg-gradient-to-br from-[#9945FF] to-[#14F195] text-white" },
  arbitrum: { label: "A", className: "bg-[#28A0F0] text-white" },
  base: { label: "B", className: "bg-[#0052FF] text-white" },
  bnb: { label: "B", className: "bg-[#F0B90B] text-slate-950" },
  polygon: { label: "P", className: "bg-[#8247E5] text-white" },
  optimism: { label: "O", className: "bg-[#FF0420] text-white" },
  avalanche: { label: "A", className: "bg-[#E84142] text-white" },
}

const FALLBACK_STYLE: ChainStyle = { label: "?", className: "bg-slate-700 text-slate-300" }

interface ChainLogoProps {
  chainId: string
  /**
   * Optional logo URL from a data provider — tried after the local asset and
   * before the monogram. No provider currently wired into this project returns
   * a per-chain logo URL (GeckoTerminal/DexScreener give per-token logos, not
   * per-chain), so this tier is unused today but the prop exists so one can be
   * plugged in later (e.g. a future chain-metadata provider) without touching
   * this component again.
   */
  logoUrl?: string
  size?: number
  className?: string
}

type Stage = "asset" | "logoUrl" | "monogram"

/**
 * Three-tier fallback: local SVG asset (public/chains/{chainId}.svg) → provided
 * logoUrl → colored monogram. The local asset files don't exist yet in this repo
 * (this sandbox has no network access to fetch/vendor them — see the
 * implementation report), so today every chain resolves straight to the
 * monogram tier. Once real SVGs are dropped into public/chains/ (same path
 * constants/landing.ts's SUPPORTED_CHAINS already expects for the landing page
 * carousel), this component picks them up automatically — no code change needed.
 */
export function ChainLogo({ chainId, logoUrl, size = 20, className = "" }: ChainLogoProps) {
  const [stage, setStage] = useState<Stage>("asset")
  const dimension = { width: size, height: size }

  if (stage === "asset") {
    return (
      <img
        src={`/chains/${chainId}.svg`}
        alt=""
        aria-hidden="true"
        style={dimension}
        className={`shrink-0 rounded-full ${className}`}
        onError={() => setStage(logoUrl ? "logoUrl" : "monogram")}
      />
    )
  }

  if (stage === "logoUrl" && logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        aria-hidden="true"
        style={dimension}
        className={`shrink-0 rounded-full ${className}`}
        onError={() => setStage("monogram")}
      />
    )
  }

  const style = CHAIN_STYLES[chainId] ?? FALLBACK_STYLE
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${style.className} ${className}`}
      style={dimension}
      aria-hidden="true"
    >
      {style.label}
    </span>
  )
}
