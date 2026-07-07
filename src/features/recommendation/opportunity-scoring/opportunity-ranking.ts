import { validateOpportunity } from "./validation"
import type { OpportunityEvaluationInput, RankedOpportunity } from "./types"

/**
 * Deterministic comparator: sorts by overall score descending. Opportunities
 * with no overall score (scoring couldn't produce one) sort last rather than
 * being treated as a fabricated zero or average score.
 */
export function compareOpportunities(a: OpportunityEvaluationInput, b: OpportunityEvaluationInput): number {
  const scoreA = a.scoring.overallScore
  const scoreB = b.scoring.overallScore

  if (typeof scoreA === "number" && typeof scoreB === "number") return scoreB - scoreA
  if (typeof scoreA === "number") return -1
  if (typeof scoreB === "number") return 1
  return 0
}

/**
 * Ranks a list of already-scored opportunities: sorts them deterministically
 * by overall score, validates each one (see validation.ts), and assigns a
 * final 1-based rank. Pure function — never mutates the input array or any
 * opportunity within it; always returns new result objects. No opportunity
 * is excluded here based on its validation verdict — pair this with
 * filterValidOpportunities first if only valid opportunities should be
 * ranked.
 */
export function rankOpportunities(inputs: OpportunityEvaluationInput[]): RankedOpportunity[] {
  const sorted = [...inputs].sort(compareOpportunities)

  return sorted.map((input, index) => ({
    ...input,
    validation: validateOpportunity(input),
    rank: index + 1,
  }))
}
