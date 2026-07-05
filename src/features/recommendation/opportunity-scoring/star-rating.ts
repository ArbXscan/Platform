import type { StarRating } from "./types"

/**
 * Maps a 0-100 overall score onto a 1-5 star rating. Only ever called with a
 * defined overallScore — a report with no overall score has no star rating
 * either (see scoring-engine.ts), rather than defaulting to a fabricated
 * middle value.
 */
export function deriveStarRating(overallScore: number): StarRating {
  const stars = Math.round(overallScore / 20)
  return Math.max(1, Math.min(5, stars)) as StarRating
}
