export const APP_NAME = "ArbXscan"

/** Milliseconds before a services/api/client.ts request is aborted. */
export const API_TIMEOUT_MS = 10_000

/** How often dashboard/market data should be considered stale and worth refetching. */
export const MARKET_REFRESH_INTERVAL_MS = 30_000

/** Arbitrage data moves faster — shorter refresh window. */
export const ARBITRAGE_REFRESH_INTERVAL_MS = 15_000

/** Below this net profit, an opportunity isn't worth surfacing (still just a placeholder default — not yet a validated product decision). */
export const MIN_PROFIT_USD_THRESHOLD = 5
