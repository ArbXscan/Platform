import type { OpportunityValidationThresholds } from "./types"

/**
 * Default thresholds for the Opportunity Validation Pipeline. These are
 * configuration, not asset data — every validation entry point accepts an
 * optional override, so nothing here is a hardcoded, unconfigurable limit.
 */
export const DEFAULT_VALIDATION_THRESHOLDS: OpportunityValidationThresholds = {
  minLiquidityUsd: 10_000,
  minVolume24hUsd: 5_000,
  minConfidenceScore: 40,
  minNetProfitUsd: 0,
  maxAcceptableRiskLevel: "medium",
}
