import { apiGet } from "../api/client"

/**
 * GeckoTerminal public API (api.geckoterminal.com/api/v2). Free, no API key,
 * rate limit 30 req/min — confirmed via https://apiguide.geckoterminal.com/ (checked July 2026).
 * Response format is JSON:API (data/attributes), unlike DexScreener's flat JSON —
 * these two providers are intentionally NOT normalized to the same shape here;
 * that happens one layer up in features/market/market.service.ts.
 *
 * NOT YET VERIFIED: browser CORS support, same caveat as services/providers/dexscreener.ts.
 *
 * Network id note: GeckoTerminal's network ids don't always match our internal
 * chain ids in constants/chains.ts 1:1 (e.g. it uses "eth" not "ethereum" for some
 * networks). GECKOTERMINAL_NETWORK_MAP below is a best-effort mapping based on the
 * docs examples seen — verify against /api/v2/networks if any chain 404s.
 */
const BASE_URL = "https://api.geckoterminal.com/api/v2"

/** Maps our internal chain ids (constants/chains.ts) to GeckoTerminal's network ids. */
export const GECKOTERMINAL_NETWORK_MAP: Record<string, string> = {
  ethereum: "eth",
  solana: "solana",
  arbitrum: "arbitrum",
  base: "base",
  bnb: "bsc",
  polygon: "polygon_pos",
  optimism: "optimism",
  avalanche: "avax",
}

interface GeckoTerminalPoolAttributes {
  address: string
  name: string // e.g. "JUPITER / WETH" — split on " / " to get base/quote symbols
  base_token_price_usd: string
  pool_created_at: string
  fdv_usd: string | null
  reserve_in_usd: string | null
  price_change_percentage: { h1?: string; h6?: string; h24?: string }
  volume_usd: { h1?: string; h6?: string; h24?: string }
}

export interface GeckoTerminalPool {
  id: string
  type: "pool"
  attributes: GeckoTerminalPoolAttributes
}

interface PoolsResponse {
  data: GeckoTerminalPool[]
}

/** GET /networks/{network}/trending_pools */
export async function getTrendingPools(chainId: string): Promise<GeckoTerminalPool[]> {
  const network = GECKOTERMINAL_NETWORK_MAP[chainId]
  if (!network) {
    throw new Error(`No GeckoTerminal network mapping for chain "${chainId}"`)
  }
  const url = `${BASE_URL}/networks/${network}/trending_pools`
  const res = await apiGet<PoolsResponse>(url, { provider: "geckoterminal" })
  return res.data
}
