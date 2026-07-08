import { useCallback } from "react"
import { useLocalStorageList } from "./useLocalStorageList"
import type { ArbitrageOpportunity } from "../types/arbitrage"

export interface FavoriteOpportunityEntry {
  id: string
  tokenSymbol: string
  tokenAddress: string
  chainId: string
  logoUrl?: string
  buyExchange: string
  sellExchange: string
  priceDiffPercent: number
  favoritedAt: string
}

const STORAGE_KEY = "arbxscan.favorites"
const MAX_FAVORITES = 50

function entryId(entry: Pick<FavoriteOpportunityEntry, "id">): string {
  return entry.id
}

/**
 * Client-side favorites list of arbitrage opportunities, persisted to
 * localStorage (hooks/useLocalStorageList.ts) — distinct from the token
 * Watchlist (hooks/useWatchlist.ts): Favorites tracks specific detected
 * opportunities (a token plus its buy/sell route), not tokens in general.
 */
export function useFavorites() {
  const { items, add, remove, has, clear } = useLocalStorageList<FavoriteOpportunityEntry>(
    STORAGE_KEY,
    entryId,
    MAX_FAVORITES,
  )

  const isFavorited = useCallback((id: string) => has(id), [has])

  const toggle = useCallback(
    (opportunity: ArbitrageOpportunity) => {
      if (has(opportunity.id)) {
        remove(opportunity.id)
        return
      }
      add({
        id: opportunity.id,
        tokenSymbol: opportunity.token.symbol,
        tokenAddress: opportunity.token.address,
        chainId: opportunity.token.chainId,
        logoUrl: opportunity.token.logoUrl,
        buyExchange: opportunity.buyFrom.exchange,
        sellExchange: opportunity.sellTo.exchange,
        priceDiffPercent: opportunity.priceDiffPercent,
        favoritedAt: new Date().toISOString(),
      })
    },
    [add, remove, has],
  )

  return { favorites: items, toggle, remove, isFavorited, clear }
}
