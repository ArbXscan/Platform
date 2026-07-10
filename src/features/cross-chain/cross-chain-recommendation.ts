import type { ArbitrageProfit } from "./arbitrage-profit-calculator"
import type { CrossChainOpportunity } from "./normalized-opportunity"

export type CrossChainRecommendationAction = "BUY" | "SKIP" | "AVOID"
export type CrossChainRiskLevel = "LOW" | "MEDIUM" | "HIGH"

/** Deterministic recommendation for one CrossChainOpportunity + ArbitrageProfit pair. */
export interface CrossChainRecommendation {
  recommendation: CrossChainRecommendationAction
  /** 0-100, clamped. Always 0 when the recommendation is SKIP due to missing data. */
  confidenceScore: number
  riskLevel: CrossChainRiskLevel
  reasons: string[]
  summary: string
}

/**
 * Liquidity and spread thresholds used only by this engine's own BUY/SKIP/
 * AVOID and risk-level rules — not shared with, or borrowed from, any other
 * module's thresholds (e.g. the Recommendation Engine's), since this
 * engine must stay fully independent of that one.
 */
const HIGH_LIQUIDITY_USD = 50_000
const MEDIUM_LIQUIDITY_USD = 5_000

/** Below this, a spread is likely just market noise/fees rather than a real, executable opportunity. */
const MIN_MEANINGFUL_SPREAD_PERCENT = 0.5
/** Above this, a spread is more likely stale or inaccurate pricing data than a genuine opportunity — this is a data-quality signal derived only from the spread figure itself, not a volatility or slippage prediction. */
const SUSPICIOUS_SPREAD_PERCENT = 25

/** Below this net margin, the opportunity likely isn't worth the execution risk/complexity, even though it's technically profitable. */
const MIN_MEANINGFUL_NET_PROFIT_PERCENT = 0.5

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

function skipResult(reasons: string[], summary: string): CrossChainRecommendation {
  return {
    recommendation: "SKIP",
    confidenceScore: 0,
    riskLevel: "HIGH",
    reasons,
    summary,
  }
}

/**
 * Risk level from liquidity and spread only — the two allowed inputs that
 * speak to execution risk here. A missing/invalid value or a suspiciously
 * large spread is always HIGH risk, never guessed as lower.
 */
function computeRiskLevel(liquidity: number, spreadPercent: number): CrossChainRiskLevel {
  if (!isPositiveFiniteNumber(liquidity) || !isFiniteNumber(spreadPercent)) return "HIGH"
  if (spreadPercent > SUSPICIOUS_SPREAD_PERCENT) return "HIGH"
  if (liquidity >= HIGH_LIQUIDITY_USD && spreadPercent <= 10) return "LOW"
  if (liquidity >= MEDIUM_LIQUIDITY_USD) return "MEDIUM"
  return "HIGH"
}

/**
 * Deterministic 0-100 confidence score from liquidity depth (up to 50
 * points) and net profit margin (up to 50 points, only once net profit is
 * actually known). Pure function of the allowed inputs only — no
 * volatility, gas, bridge, slippage, or AI prediction feeds into this.
 */
function computeConfidenceScore(liquidity: number, netProfitPercent: number | undefined): number {
  let liquidityScore = 0
  if (liquidity >= HIGH_LIQUIDITY_USD) liquidityScore = 50
  else if (liquidity >= MEDIUM_LIQUIDITY_USD) liquidityScore = 30
  else if (liquidity > 0) liquidityScore = 10

  let profitScore = 0
  if (isFiniteNumber(netProfitPercent) && netProfitPercent > 0) {
    profitScore = Math.min(50, netProfitPercent * 5)
  }

  return Math.round(Math.min(100, Math.max(0, liquidityScore + profitScore)))
}

/**
 * Milestone 4.3 — Cross-Chain Recommendation Engine.
 *
 * Reuses CrossChainOpportunity (Milestone 4.1) and ArbitrageProfit
 * (Milestone 4.2) as-is — no spread, liquidity, fee, or profit math is
 * recalculated here, only evaluated against fixed, deterministic
 * thresholds using exactly the allowed inputs: spreadPercent, liquidity,
 * netProfitUsd, netProfitPercent, roiPercent, and profitable. Fully
 * independent of the UI, Search, Dashboard, Landing Page, Scanner Page,
 * and the existing (separate) Recommendation Engine — it imports nothing
 * from any of them.
 *
 * Never estimates volatility, gas, bridge speed, slippage, or anything
 * AI-predicted — those are later milestones. Never fabricates a value: any
 * required input that's missing, undefined, NaN, or Infinity results in
 * SKIP with an explanation rather than a guessed recommendation. A
 * confirmed non-positive net profit results in AVOID, since that's a known
 * outcome rather than missing data. Deterministic and side-effect free:
 * the same opportunity/profit pair always produces the same recommendation,
 * and this function never throws.
 */
export function generateCrossChainRecommendation(
  opportunity: CrossChainOpportunity,
  profit: ArbitrageProfit,
): CrossChainRecommendation {
  if (!opportunity || !profit) {
    return skipResult(
      ["Opportunity or profit data was not provided."],
      "Skipped: no opportunity/profit data to evaluate.",
    )
  }

  const { spreadPercent, liquidity } = opportunity
  const { netProfitUsd, netProfitPercent, roiPercent } = profit

  if (!isFiniteNumber(spreadPercent)) {
    return skipResult(["Spread percent is missing or invalid."], "Skipped: spread could not be determined.")
  }

  if (!isPositiveFiniteNumber(liquidity)) {
    return skipResult(["Liquidity is missing, zero, or invalid."], "Skipped: liquidity could not be determined.")
  }

  if (netProfitUsd === undefined || !isFiniteNumber(netProfitUsd)) {
    return skipResult(
      ["Net profit is unavailable (fees are not fully known yet)."],
      "Skipped: net profit cannot be confirmed without complete fee data.",
    )
  }

  const riskLevel = computeRiskLevel(liquidity, spreadPercent)
  const confidenceScore = computeConfidenceScore(liquidity, isFiniteNumber(netProfitPercent) ? netProfitPercent : undefined)
  const reasons: string[] = []

  reasons.push(
    netProfitUsd > 0
      ? `Net profit is positive ($${netProfitUsd.toFixed(2)}).`
      : `Net profit is not positive ($${netProfitUsd.toFixed(2)}).`,
  )
  reasons.push(`Liquidity is $${liquidity.toFixed(2)}.`)
  reasons.push(`Spread is ${spreadPercent.toFixed(2)}%.`)
  if (isFiniteNumber(netProfitPercent)) reasons.push(`Net profit margin is ${netProfitPercent.toFixed(2)}%.`)
  if (isFiniteNumber(roiPercent)) reasons.push(`ROI is ${roiPercent.toFixed(2)}%.`)

  if (netProfitUsd <= 0) {
    reasons.push("Confirmed non-profitable after known fees.")
    return {
      recommendation: "AVOID",
      confidenceScore,
      riskLevel,
      reasons,
      summary: "Avoid: this opportunity is not profitable after known fees.",
    }
  }

  if (spreadPercent > SUSPICIOUS_SPREAD_PERCENT) {
    reasons.push(
      `Spread exceeds ${SUSPICIOUS_SPREAD_PERCENT}%, which is more likely stale or inaccurate pricing than a real opportunity.`,
    )
    return {
      recommendation: "SKIP",
      confidenceScore,
      riskLevel,
      reasons,
      summary: "Skip: spread is unusually large and likely unreliable.",
    }
  }

  if (spreadPercent < MIN_MEANINGFUL_SPREAD_PERCENT) {
    reasons.push(`Spread is below ${MIN_MEANINGFUL_SPREAD_PERCENT}%, likely within normal market noise/fee range.`)
    return {
      recommendation: "SKIP",
      confidenceScore,
      riskLevel,
      reasons,
      summary: "Skip: spread is too small to be a meaningful opportunity.",
    }
  }

  if (isFiniteNumber(netProfitPercent) && netProfitPercent < MIN_MEANINGFUL_NET_PROFIT_PERCENT) {
    reasons.push(`Net profit margin is below ${MIN_MEANINGFUL_NET_PROFIT_PERCENT}%, likely not worth the execution risk.`)
    return {
      recommendation: "SKIP",
      confidenceScore,
      riskLevel,
      reasons,
      summary: "Skip: net profit margin is too thin.",
    }
  }

  if (liquidity < MEDIUM_LIQUIDITY_USD) {
    reasons.push(`Liquidity is below $${MEDIUM_LIQUIDITY_USD.toLocaleString()}, too low to execute reliably.`)
    return {
      recommendation: "SKIP",
      confidenceScore,
      riskLevel,
      reasons,
      summary: "Skip: liquidity is too low to execute reliably.",
    }
  }

  reasons.push("Profitable with acceptable spread, margin, and liquidity.")
  return {
    recommendation: "BUY",
    confidenceScore,
    riskLevel,
    reasons,
    summary: "Buy: profitable opportunity with acceptable risk given currently available data.",
  }
}
