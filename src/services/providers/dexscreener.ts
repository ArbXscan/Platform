import { apiGet } from "../api/client"

/**
 * DexScreener public API. Base URL, endpoints, and the Pair shape below are taken
 * directly from https://docs.dexscreener.com/api/reference (checked July 2026).
 * No API key required for these endpoints. Rate limit: 300 req/min per DexScreener's docs.
 *
 * NOT YET VERIFIED: whether api.dexscreener.com sends CORS headers for arbitrary
 * browser origins. It's a commonly-used-client-side API, but this repo has no way
 * to execute a real network request to confirm — test this first when you run the
 * app for real. If calls get blocked by CORS, this file is the only place that
 * needs to change (route through a small proxy).
 */
const BASE_URL = "https://api.dexscreener.com"

export interface DexScreenerToken {
  address: string
  name: string
  symbol: string
}

export interface DexScreenerPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: DexScreenerToken
  quoteToken: DexScreenerToken
  priceNative: string
  priceUsd?: string
  txns: Record<string, { buys: number; sells: number }>
  volume: Record<string, number>
  priceChange?: Record<string, number>
  liquidity?: { usd?: number; base: number; quote: number }
  fdv?: number
  marketCap?: number
  pairCreatedAt?: number
  info?: {
    imageUrl?: string
    websites?: { url: string }[]
    socials?: { platform: string; handle: string }[]
  }
}

interface SearchResponse {
  schemaVersion: string
  pairs: DexScreenerPair[] | null
}

/** GET /latest/dex/search?q= — search pairs by token symbol, name, or address. */
export async function searchPairs(query: string): Promise<DexScreenerPair[]> {
  const url = `${BASE_URL}/latest/dex/search?q=${encodeURIComponent(query)}`
  const res = await apiGet<SearchResponse>(url, { provider: "dexscreener" })
  return res.pairs ?? []
}

/** GET /token-pairs/v1/{chainId}/{tokenAddress} — all pairs trading a given token. */
export async function getPairsForToken(
  chainId: string,
  tokenAddress: string,
): Promise<DexScreenerPair[]> {
  const url = `${BASE_URL}/token-pairs/v1/${chainId}/${tokenAddress}`
  return apiGet<DexScreenerPair[]>(url, { provider: "dexscreener" })
}
