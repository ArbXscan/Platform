import { FiStar } from "react-icons/fi"
import type { StarRating } from "../../features/recommendation/opportunity-scoring"
import type { RecommendationLevel } from "../../features/recommendation/recommendation-engine"

interface RecommendationHeaderProps {
  recommendationLevel: RecommendationLevel
  starRating?: StarRating
  overallScore?: number
}

const LEVEL_STYLES: Record<RecommendationLevel, string> = {
  "Highly Recommended": "bg-emerald-400/10 text-emerald-300",
  Recommended: "bg-emerald-400/10 text-emerald-300",
  Neutral: "bg-slate-400/10 text-slate-300",
  "High Risk": "bg-orange-400/10 text-orange-300",
  "Not Recommended": "bg-red-400/10 text-red-300",
}

/**
 * Presentation-only header for a recommendation card: recommendation level
 * badge, star rating, and overall score. Renders exactly what it's given —
 * no scoring, thresholds, or level derivation happens here.
 */
export function RecommendationHeader({ recommendationLevel, starRating, overallScore }: RecommendationHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${LEVEL_STYLES[recommendationLevel]}`}>
        {recommendationLevel}
      </span>

      <div className="flex items-center gap-3">
        {typeof starRating === "number" && (
          <div className="flex items-center gap-0.5" aria-label={`${starRating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar
                key={i}
                className={i < starRating ? "text-amber-400" : "text-slate-700"}
                fill={i < starRating ? "currentColor" : "none"}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
        {typeof overallScore === "number" && (
          <span className="text-sm font-semibold text-white">{Math.round(overallScore)}/100</span>
        )}
      </div>
    </div>
  )
}
