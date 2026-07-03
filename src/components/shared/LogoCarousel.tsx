import type { SupportedChain } from "../../types/landing"
import { ChainLogo } from "./ChainLogo"

interface LogoCarouselProps {
  items: SupportedChain[]
}

/** Infinite, lightweight CSS marquee (duplicated track for seamless loop). */
export function LogoCarousel({ items }: LogoCarouselProps) {
  const track = [...items, ...items]

  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max animate-marquee gap-12 group-hover:[animation-play-state:paused]">
        {track.map((chain, i) => (
          <div
            key={`${chain.id}-${i}`}
            className="flex shrink-0 items-center gap-3 opacity-70 transition-opacity hover:opacity-100"
          >
            {/*
              Previously: a raw <img src={chain.logo}> that silently hid itself
              on error (display: none), so a missing logo file meant a blank gap.
              ChainLogo does the same asset-first lookup but falls back to a
              brand-colored monogram instead of disappearing.
            */}
            <ChainLogo chainId={chain.id} logoUrl={chain.logo} size={32} />
            <span className="text-lg font-semibold text-slate-200">{chain.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
