import { calculateBridgeRisk } from "./bridge-risk"
import { calculateExecutionRisk } from "./execution-risk"
import { calculateLiquidityRisk } from "./liquidity-risk"
import { calculateSlippageRisk } from "./slippage-risk"
import type { NormalizedMarketSnapshot, RiskComponent, RiskLevel, RiskReport } from "./types"
import { calculateVolatilityRisk } from "./volatility-risk"

/** Severity ordering used to derive the overall level. "unknown" components are excluded from this comparison. */
const SEVERITY: Record<Exclude<RiskLevel, "unknown">, number> = { low: 0, medium: 1, high: 2 }

function deriveOverallLevel(components: RiskComponent[]): RiskLevel {
  const known = components.filter((component): component is RiskComponent & { level: Exclude<RiskLevel, "unknown"> } =>
    component.level !== "unknown",
  )

  if (known.length === 0) return "unknown"

  return known.reduce(
    (worst, component) => (SEVERITY[component.level] > SEVERITY[worst] ? component.level : worst),
    known[0].level,
  )
}

/**
 * Runs every risk component against a normalized market snapshot and
 * combines them into one RiskReport. Fully provider-agnostic — it only reads
 * the NormalizedMarketSnapshot shape defined in this module, never a
 * specific market/router provider's response. This is the integration point
 * a future Recommendation Engine calls; nothing calls it yet.
 */
export function runRiskEngine(snapshot: NormalizedMarketSnapshot): RiskReport {
  const liquidity = calculateLiquidityRisk(snapshot)
  const slippage = calculateSlippageRisk(snapshot)
  const bridge = calculateBridgeRisk(snapshot)
  const execution = calculateExecutionRisk(snapshot)
  const volatility = calculateVolatilityRisk(snapshot)

  return {
    tokenAddress: snapshot.tokenAddress,
    chainId: snapshot.chainId,
    liquidity,
    slippage,
    bridge,
    execution,
    volatility,
    overallLevel: deriveOverallLevel([liquidity, slippage, bridge, execution, volatility]),
    generatedAt: new Date().toISOString(),
  }
}
