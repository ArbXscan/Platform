import type { NormalizedMarketSnapshot, RiskComponent } from "./types"

/**
 * Scores bridge risk from how many bridge hops executing both legs together
 * would require. No hop count means the opportunity is single-chain and no
 * bridge is involved at all — that's a real, known state (low risk), not
 * missing data, so it's distinguished from "unknown".
 */
export function calculateBridgeRisk(snapshot: NormalizedMarketSnapshot): RiskComponent {
  const hopCount = snapshot.bridgeHopCount

  if (hopCount === undefined) {
    return {
      level: "low",
      score: 0,
      reason: "No bridge hop is required for this opportunity.",
    }
  }

  if (!Number.isFinite(hopCount) || hopCount < 0) {
    return {
      level: "unknown",
      reason: "Bridge hop count is invalid or could not be determined.",
    }
  }

  if (hopCount === 0) {
    return {
      level: "low",
      score: 0,
      reason: "No bridge hop is required for this opportunity.",
    }
  }

  if (hopCount === 1) {
    return {
      level: "medium",
      score: 55,
      reason: "Executing this opportunity requires crossing one bridge.",
    }
  }

  return {
    level: "high",
    score: 90,
    reason: `Executing this opportunity requires crossing ${hopCount} bridges.`,
  }
}
