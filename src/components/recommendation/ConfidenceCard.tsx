import type { OverallConfidenceLevel } from "../../features/recommendation/recommendation-engine"

interface ConfidenceCardProps {
  overallConfidence: OverallConfidenceLevel
}

const LEVEL_STYLES: Record<OverallConfidenceLevel, string> = {
  high: "bg-emerald-400/10 text-emerald-300",
  medium: "bg-amber-400/10 text-amber-300",
  low: "bg-orange-400/10 text-orange-300",
  unknown: "bg-slate-400/10 text-slate-400",
}

const LEVEL_DESCRIPTIONS: Record<OverallConfidenceLevel, string> = {
  high: "Both quote and risk data were available and favorable.",
  medium: "Quote and risk data were available but mixed.",
  low: "Quote or risk data indicated meaningful uncertainty.",
  unknown: "Confidence could not be determined from the available data.",
}

/**
 * Presentation-only confidence indicator. Renders whichever
 * OverallConfidenceLevel the Recommendation Engine already determined — no
 * confidence calculation happens here.
 */
export function ConfidenceCard({ overallConfidence }: ConfidenceCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Confidence</h3>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[overallConfidence]}`}
        >
          {overallConfidence}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-600">{LEVEL_DESCRIPTIONS[overallConfidence]}</p>
    </div>
  )
}
