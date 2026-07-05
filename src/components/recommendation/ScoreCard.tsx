import type { OpportunityScoreReport, ScoreComponent } from "../../features/recommendation/opportunity-scoring"

interface ScoreCardProps {
  scoring: OpportunityScoreReport
}

function ScoreRow({ label, component }: { label: string; component: ScoreComponent }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      {typeof component.score === "number" ? (
        <span className="font-medium text-white">{Math.round(component.score)}/100</span>
      ) : (
        <span className="text-xs text-slate-600">Not available</span>
      )}
    </div>
  )
}

/**
 * Presentation-only breakdown of an OpportunityScoreReport's four
 * components. Renders whatever the scoring engine produced — no weighting,
 * aggregation, or score math happens here.
 */
export function ScoreCard({ scoring }: ScoreCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Opportunity Score</h3>
        {typeof scoring.overallScore === "number" ? (
          <span className="text-lg font-semibold text-white">{Math.round(scoring.overallScore)}/100</span>
        ) : (
          <span className="text-xs text-slate-600">Not available</span>
        )}
      </div>
      <div className="mt-2 divide-y divide-white/5">
        <ScoreRow label="Profit" component={scoring.profit} />
        <ScoreRow label="Liquidity" component={scoring.liquidity} />
        <ScoreRow label="Risk" component={scoring.risk} />
        <ScoreRow label="Confidence" component={scoring.confidence} />
      </div>
    </div>
  )
}
