import type { ReactNode } from "react"

interface ScannerLayoutProps {
  children: ReactNode
}

/**
 * Page chrome for the Scanner Page — heading, description, and padding
 * wrapper, matching the existing page layout convention (see
 * pages/recommendation/RecommendationLayout.tsx and
 * pages/arbitrage/ArbitragePage.tsx). Presentation only: no data, state, or
 * calculation lives here.
 */
export function ScannerLayout({ children }: ScannerLayoutProps) {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-white">Scanner</h1>
      <p className="mt-2 text-sm text-slate-400">
        Full Scanner Integration flow for one query: search match, asset identity, token scan,
        cross-chain opportunity, and recommendation.
      </p>
      <div className="mt-6">{children}</div>
    </div>
  )
}
