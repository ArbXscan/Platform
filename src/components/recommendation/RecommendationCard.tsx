import type { OpportunityScoreReport } from "../../features/recommendation/opportunity-scoring"
import type { RecommendationReport } from "../../features/recommendation/recommendation-engine"
import type { RiskReport } from "../../features/recommendation/risk-engine"
import { ConfidenceCard } from "./ConfidenceCard"
import { OpenActions } from "./OpenActions"
import { RecommendationHeader } from "./RecommendationHeader"
import { RiskCard } from "./RiskCard"
import { ScoreCard } from "./ScoreCard"
import { SuggestedActionCard } from "./SuggestedActionCard"
import { SummaryCard } from "./SummaryCard"
import { WarningCard } from "./WarningCard"

interface RecommendationCardActions {
  buyDexUrl?: string
  buyDexLabel?: string
  sellDexUrl?: string
  sellDexLabel?: string
  bridgeUrl?: string
  bridgeLabel?: string
}

interface RecommendationCardProps {
  recommendation: RecommendationReport
  scoring: OpportunityScoreReport
  risk: RiskReport
  /** Pre-resolved action links, e.g. from DexActionPanel/bridge-registry. Omit to hide the action row entirely. */
  actions?: RecommendationCardActions
}

/**
 * Composed, presentation-only card for one opportunity's full recommendation
 * output — the outputs of the existing Recommendation Pipeline
 * (features/recommendation/pipeline), rendered as-is. This component
 * performs no scoring, risk, or recommendation calculation of its own; it
 * only arranges the sub-components that each display one part of the
 * already-computed result.
 */
export function RecommendationCard({ recommendation, scoring, risk, actions }: RecommendationCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <RecommendationHeader
        recommendationLevel={recommendation.recommendationLevel}
        starRating={recommendation.starRating}
        overallScore={recommendation.opportunityScore}
      />

      <SummaryCard summary={recommendation.summary} />

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreCard scoring={scoring} />
        <RiskCard risk={risk} />
      </div>

      <ConfidenceCard overallConfidence={recommendation.overallConfidence} />

      <WarningCard warnings={recommendation.warnings} />
      <SuggestedActionCard actions={recommendation.suggestedActions} />

      {actions && (
        <OpenActions
          buyDexUrl={actions.buyDexUrl}
          buyDexLabel={actions.buyDexLabel}
          sellDexUrl={actions.sellDexUrl}
          sellDexLabel={actions.sellDexLabel}
          bridgeUrl={actions.bridgeUrl}
          bridgeLabel={actions.bridgeLabel}
        />
      )}
    </div>
  )
}
