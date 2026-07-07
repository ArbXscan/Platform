import type { IdentityConfidence, MatchType } from "./types"

/** Base score per match specificity, from most to least specific. "none" never reaches this function since non-matching assets are filtered out before scoring. */
const MATCH_TYPE_SCORE: Record<MatchType, number> = {
  "exact-symbol": 100,
  "exact-name": 90,
  prefix: 70,
  contains: 50,
  none: 0,
}

/** Deduction applied per identity confidence level, since a strong text match against weakly-confirmed asset data is still less trustworthy overall. */
const IDENTITY_CONFIDENCE_DEDUCTION: Record<IdentityConfidence, number> = {
  high: 0,
  medium: 10,
  low: 25,
  unknown: 40,
}

/**
 * Computes a deterministic 0-100 confidence score for one search match, from
 * its match specificity and the underlying asset's identity confidence.
 * Pure function: same inputs always produce the same score, clamped to
 * [0, 100] — never a fabricated or randomized value.
 */
export function calculateSearchConfidenceScore(matchType: MatchType, identityConfidence: IdentityConfidence): number {
  const base = MATCH_TYPE_SCORE[matchType]
  const deduction = IDENTITY_CONFIDENCE_DEDUCTION[identityConfidence]
  return Math.max(0, Math.min(100, base - deduction))
}
