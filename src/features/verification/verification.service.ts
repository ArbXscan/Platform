import { getPairsForToken, type DexScreenerPair } from "../../services/providers/dexscreener"
import type { DataSourceMeta } from "../../types/api"
import type { ArbitrageOpportunity } from "../../types/arbitrage"
import type { OpportunityVerification, QuoteLegVerification } from "../../types/verification"

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Picks the deepest-liquidity pair for a given DEX from a re-fetched pair list,
 * matching the same tie-break rule findOpportunitiesForToken uses in
 * features/arbitrage/arbitrage.service.ts, so a re-quote finds the same pool
 * the original scan would have picked when a DEX has multiple pools.
 */
function findDeepestPairForDex(pairs: DexScreenerPair[], dexId: string): DexScreenerPair | undefined {
  let best: DexScreenerPair | undefined
  for (const pair of pairs) {
    if (pair.dexId !== dexId) continue
    if (!best || (pair.liquidity?.usd ?? 0) > (best.liquidity?.usd ?? 0)) {
      best = pair
    }
  }
  return best
}

function toLegVerification(pair: DexScreenerPair): QuoteLegVerification | undefined {
  const priceUsd = toNumber(pair.priceUsd)
  if (priceUsd <= 0) return undefined
  return {
    exchange: pair.dexId,
    priceUsd,
    liquidityUsd: pair.liquidity?.usd ?? 0,
  }
}

/**
 * Re-quotes a single ArbitrageOpportunity against fresh provider data to check
 * whether it's still actionable. Fully decoupled from the Arbitrage Engine —
 * takes a finished opportunity as input and never calls back into
 * features/arbitrage/arbitrage.service.ts.
 *
 * This milestone only re-checks the quote (price/liquidity) itself. Gas,
 * slippage, router, and bridge validation are left undefined on the result —
 * they require providers that aren't wired up yet.
 */
export async function verifyOpportunity(
  opportunity: ArbitrageOpportunity,
): Promise<OpportunityVerification> {
  const verifiedAt = new Date().toISOString()
  const source: DataSourceMeta = {
    provider: "dexscreener",
    fetchedAt: verifiedAt,
    // Single-source (DexScreener only) — same "medium" convention used across
    // features/market, features/token, and features/arbitrage.
    confidence: "medium",
  }

  let pairs: DexScreenerPair[]
  try {
    // token.chainId is already DexScreener's own chain id (copied from the pair
    // data during scanning in arbitrage.service.ts), so no chain-id remapping
    // is needed here.
    pairs = await getPairsForToken(opportunity.token.chainId, opportunity.token.address)
  } catch (err) {
    return {
      opportunityId: opportunity.id,
      outcome: "unverifiable",
      verifiedAt,
      originalSpreadPercent: opportunity.priceDiffPercent,
      message: err instanceof Error ? err.message : "Re-quote request failed.",
      source,
    }
  }

  const buyPair = findDeepestPairForDex(pairs, opportunity.buyFrom.exchange)
  const sellPair = findDeepestPairForDex(pairs, opportunity.sellTo.exchange)
  const buyLeg = buyPair ? toLegVerification(buyPair) : undefined
  const sellLeg = sellPair ? toLegVerification(sellPair) : undefined

  if (!buyLeg || !sellLeg) {
    return {
      opportunityId: opportunity.id,
      outcome: "invalid",
      verifiedAt,
      buyLeg,
      sellLeg,
      originalSpreadPercent: opportunity.priceDiffPercent,
      message: "One or both pools for this opportunity could no longer be found.",
      source,
    }
  }

  const currentSpreadPercent = ((sellLeg.priceUsd - buyLeg.priceUsd) / buyLeg.priceUsd) * 100
  const outcome = Number.isFinite(currentSpreadPercent) && currentSpreadPercent > 0 ? "actionable" : "stale"

  return {
    opportunityId: opportunity.id,
    outcome,
    verifiedAt,
    buyLeg,
    sellLeg,
    originalSpreadPercent: opportunity.priceDiffPercent,
    currentSpreadPercent,
    message: outcome === "stale" ? "The spread has closed or reversed since it was detected." : undefined,
    source,
  }
}
