import { useState } from "react"
import arbitrumLogo from "../../assets/chains/arbitrum.svg"
import avalancheLogo from "../../assets/chains/avalanche.svg"
import baseLogo from "../../assets/chains/base.svg"
import bnbLogo from "../../assets/chains/bnb.svg"
import ethereumLogo from "../../assets/chains/ethereum.svg"
import optimismLogo from "../../assets/chains/optimism.svg"
import polygonLogo from "../../assets/chains/polygon.svg"
import solanaLogo from "../../assets/chains/solana.svg"

/** Real official SVGs, bundled from src/assets/chains/ (statically imported, so a missing file fails the build loudly instead of silently 404-ing at runtime). */
const CHAIN_ASSETS: Record<string, string> = {
  ethereum: ethereumLogo,
  arbitrum: arbitrumLogo,
  avalanche: avalancheLogo,
  base: baseLogo,
  bnb: bnbLogo,
  optimism: optimismLogo,
  polygon: polygonLogo,
  solana: solanaLogo,
}

interface ChainStyle {
  label: string
  className: string
}

/**
 * Official brand colors per chain — used only for the monogram fallback tier.
 *
 * TODO(robinhood): Robinhood Chain has no verified official hex color here
 * yet — Robinhood's own newsroom post (robinhood.com/us/en/newsroom/a-new-visual-identity)
 * only names an unspecified "Robin Neon" green, and third-party color sites
 * disagree with each other, so nothing is asserted as "official" until a
 * real value is sourced from Robinhood's press kit. Until then it's left out
 * of this map entirely and falls through to FALLBACK_STYLE below, same as
 * any other unmapped chain — never a guessed color.
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
   * Optional logo URL from a data provider — tried if chainId isn't one of the
   * 8 chains with a bundled asset above. No provider currently returns a
   * per-chain logo, so this tier is effectively unused today; kept for forward
   * compatibility (props unchanged, per the integration scope).
   */
  logoUrl?: string
  size?: number
  className?: string
}

type Stage = "logoUrl" | "monogram"

export function ChainLogo({ chainId, logoUrl, size = 20, className = "" }: ChainLogoProps) {
  const [stage, setStage] = useState<Stage>("logoUrl")
  const dimension = { width: size, height: size }
  const asset = CHAIN_ASSETS[chainId]

  // Tier 1: real bundled SVG. Statically imported above, so this is always
  // present for the 8 known chains — no runtime existence check needed.
  if (asset) {
    return (
      <img
        src={asset}
        alt=""
        aria-hidden="true"
        style={dimension}
        className={`shrink-0 rounded-full ${className}`}
      />
    )
  }

  // Tier 2: provider-supplied logoUrl, for chains without a bundled asset.
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

  // Tier 3: colored monogram.
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
