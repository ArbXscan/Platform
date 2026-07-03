import { searchPairs, type DexScreenerPair } from "../../services/providers/dexscreener"
import type { DataSourceMeta } from "../../types/api"
import type { TokenDetail } from "../../types/token"

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Picks the pair with the highest USD liquidity as the "primary" pair for a
 * token — its price/marketCap/fdv are treated as the token's headline values,
 * since a token can trade on many pairs/DEXs at once with slightly different
 * numbers. Same convention as market.service.ts using GeckoTerminal for the
 * dashboard: one clear number per field, not an unweighted average.
 */
function pickPrimaryPair(pairs: DexScreenerPair[]): DexScreenerPair {
  return pairs.reduce((best, p) => ((p.liquidity?.usd ?? 0) > (best.liquidity?.usd ?? 0) ? p : best))
}

/**
 * Step 2 only uses DexScreener. GeckoTerminal's provider file (services/providers/geckoterminal.ts)
 * currently only implements getTrendingPools — it has no arbitrary token/address search endpoint
 * wired up yet, so there's nothing to cross-validate against without adding a new provider function,
 * which is a separate increment ("one provider at a time" per roadmap). DexScreener's /search endpoint
 * already covers all three MVP search modes (address, symbol, name), so it's sufficient for Step 2.
 */
function toTokenDetail(pairs: DexScreenerPair[]): TokenDetail {
  const primary = pickPrimaryPair(pairs)

  // All pairs that share the same base token (same address, same chain) — used to
  // aggregate liquidity/volume across every pool this token trades on, and to list
  // every DEX it's supported on. Pairs where this token is the *quote* token are
  // excluded, since those describe a different base token's page.
  const sameToken = pairs.filter(
    (p) => p.baseToken.address === primary.baseToken.address && p.chainId === primary.chainId,
  )

  const source: DataSourceMeta = {
    provider: "dexscreener",
    fetchedAt: new Date().toISOString(),
    // Single-source (DexScreener only) — "medium" per the same confidence convention
    // used in features/market/market.service.ts. Not "high" until cross-checked
    // against a second provider.
    confidence: "medium",
  }

  const totalLiquidityUsd = sameToken.reduce((sum, p) => sum + (p.liquidity?.usd ?? 0), 0)
  const totalVolume24hUsd = sameToken.reduce((sum, p) => sum + (p.volume?.h24 ?? 0), 0)
  const supportedExchanges = Array.from(new Set(sameToken.map((p) => p.dexId)))

  return {
    address: primary.baseToken.address,
    chainId: primary.chainId,
    symbol: primary.baseToken.symbol,
    name: primary.baseToken.name,
    // NOT available from DexScreener's pair payload (DexScreenerToken only has
    // address/name/symbol, no decimals) and not shown anywhere in the Token Detail
    // UI, so this is left as an explicit unused placeholder rather than a guessed
    // value like 18 (would be wrong for most non-EVM/non-standard tokens and
    // violates the "no fake data" rule). Real decimals need an on-chain RPC call,
    // which is a future provider increment.
    decimals: 0,
    logoUrl: primary.info?.imageUrl,
    price: {
      usd: toNumber(primary.priceUsd),
      change24h: primary.priceChange?.h24 ?? 0,
      source,
    },
    liquidity: {
      totalUsd: totalLiquidityUsd,
      poolCount: sameToken.length,
      source,
    },
    stats: {
      marketCapUsd: primary.marketCap ?? primary.fdv,
      volume24hUsd: totalVolume24hUsd,
      source,
    },
    supportedExchanges,
    sourceUrl: primary.url,
  }
}

/**
 * Resolves a search query (contract address, symbol, or name — per
 * docs/PRD/06-MVP_SCOPE.md's Token Search requirement) into a full TokenDetail.
 * Throws if nothing matches; callers (hooks/useToken.ts) surface that as an error
 * state rather than falling back to placeholder data.
 */
export async function getTokenDetail(query: string): Promise<TokenDetail> {
  const trimmed = query.trim()
  if (!trimmed) {
    throw new Error("Empty search query")
  }

  const pairs = await searchPairs(trimmed)
  if (pairs.length === 0) {
    throw new Error(`No pairs found for "${trimmed}"`)
  }

  return toTokenDetail(pairs)
}
