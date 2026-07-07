import { BaseProviderAdapter } from "../base/adapter"

/**
 * CoinMarketCap (market data) adapter stub. No HTTP calls, no SDK, no API
 * key — registered as an extension point for a future milestone that
 * implements a real market-data lookup. The app's existing DexScreener and
 * GeckoTerminal clients (services/providers/) are separate, already-live
 * integrations and are untouched by this module.
 */
export class CoinMarketCapProviderAdapter extends BaseProviderAdapter {
  readonly providerId = "coinmarketcap"
  readonly category = "market-data" as const
  protected readonly supportedChainIds = [
    "ethereum",
    "arbitrum",
    "optimism",
    "base",
    "bnb",
    "polygon",
    "avalanche",
    "solana",
  ]
}
