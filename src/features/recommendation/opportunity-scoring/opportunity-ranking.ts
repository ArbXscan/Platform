import { validateOpportunity } from "./validation"
import type { OpportunityEvaluationInput, OpportunityValidationThresholds, RankedOpportunity } from "./types"

function lower(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Deterministic comparator. Sorts by:
 *  1. overall score, descending (opportunities with no score sort last
 *     rather than being treated as a fabricated zero or average score)
 *  2. confidence component score, descending
 *  3. tokenAddress, then chainId — lexicographic, ascending
 *
 * Two opportunities can only ever be considered equal here if every one of
 * these is identical between them — nothing is ever left to depend on the
 * original input array's order.
 */
export function compareOpportunities(a: OpportunityEvaluationInput, b: OpportunityEvaluationInput): number {
  const scoreA = a.scoring.overallScore
  const scoreB = b.scoring.overallScore

  if (typeof scoreA === "number" && typeof scoreB === "number" && scoreA !== scoreB) return scoreB - scoreA
  if (typeof scoreA === "number" && typeof scoreB !== "number") return -1
  if (typeof scoreA !== "number" && typeof scoreB === "number") return 1

  const confidenceA = a.scoring.confidence.score
  const confidenceB = b.scoring.confidence.score

  if (typeof confidenceA === "number" && typeof confidenceB === "number" && confidenceA !== confidenceB) {
    return confidenceB - confidenceA
  }
  if (typeof confidenceA === "number" && typeof confidenceB !== "number") return -1
  if (typeof confidenceA !== "number" && typeof confidenceB === "number") return 1

  const addressA = lower(a.comparison.tokenAddress)
  const addressB = lower(b.comparison.tokenAddress)
  if (addressA !== addressB) return addressA < addressB ? -1 : 1

  const chainA = lower(a.risk.chainId)
  const chainB = lower(b.risk.chainId)
  if (chainA !== chainB) return chainA < chainB ? -1 : 1

  return 0
}

/**
 * Ranks a list of already-scored opportunities: sorts them deterministically
 * (see compareOpportunities), validates each one against `thresholds` (see
 * validation.ts — fully optional, falls back to DEFAULT_VALIDATION_THRESHOLDS),
 * and assigns a final 1-based rank. Pure function — never mutates the input
 * array or any opportunity within it; always returns new result objects. No
 * opportunity is excluded here based on its validation verdict — pair this
 * with filterValidOpportunities first if only valid opportunities should be
 * ranked.
 */
export function rankOpportunities(
  inputs: OpportunityEvaluationInput[],
  thresholds: Partial<OpportunityValidationThresholds> = {},
): RankedOpportunity[] {
  const sorted = [...inputs].sort(compareOpportunities)

  return sorted.map((input, index) => ({
    ...input,
    validation: validateOpportunity(input, thresholds),
    rank: index + 1,
  }))
}
