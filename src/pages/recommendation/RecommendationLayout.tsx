import type { ReactNode } from "react"

interface RecommendationLayoutProps {
  children: ReactNode
}

/**
 * Page chrome for the Recommendation Page — heading, description, and
 * padding wrapper, matching the existing page layout convention (see
 * pages/arbitrage/ArbitragePage.tsx). Presentation only: no data, state, or
 * calculation lives here.
 */
export function RecommendationLayout({ children }: RecommendationLayoutProps) {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-white">Recommendation</h1>
      <p className="mt-2 text-sm text-slate-400">
        Combined verification, risk, scoring, and recommendation output for one opportunity.
      </p>
      <div className="mt-6">{children}</div>
    </div>
  )
}
