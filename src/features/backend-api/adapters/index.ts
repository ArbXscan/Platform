import { registerProvider } from "../gateway"
import type { DataProviderAdapter } from "../gateway"
import { AlchemyProviderAdapter } from "./alchemy/adapter"
import { CoinMarketCapProviderAdapter } from "./coinmarketcap/adapter"
import { DexScreenerProviderAdapter } from "./dexscreener/adapter"
import { GeckoTerminalProviderAdapter } from "./geckoterminal/adapter"
import { MoralisProviderAdapter } from "./moralis/adapter"
import { TheGraphProviderAdapter } from "./thegraph/adapter"

export { BaseProviderAdapter } from "./base/adapter"
export { AlchemyProviderAdapter } from "./alchemy/adapter"
export { CoinMarketCapProviderAdapter } from "./coinmarketcap/adapter"
export { DexScreenerProviderAdapter } from "./dexscreener/adapter"
export { GeckoTerminalProviderAdapter } from "./geckoterminal/adapter"
export { MoralisProviderAdapter } from "./moralis/adapter"
export { TheGraphProviderAdapter } from "./thegraph/adapter"

/**
 * Every provider adapter currently available. DexScreener and GeckoTerminal
 * wrap the app's existing, already-live provider clients
 * (services/providers/) — they return real data. CoinMarketCap, Moralis,
 * Alchemy, and The Graph remain stubs that report "unsupported" (see
 * base/adapter.ts) since no real implementation exists for them yet. None
 * of these are registered with the Backend API Gateway by default, and
 * nothing in the app calls registerAllProviderAdapters() yet. This module
 * only defines the registry for a future milestone to use.
 */
export const ALL_PROVIDER_ADAPTERS: DataProviderAdapter[] = [
  new DexScreenerProviderAdapter(),
  new GeckoTerminalProviderAdapter(),
  new CoinMarketCapProviderAdapter(),
  new MoralisProviderAdapter(),
  new AlchemyProviderAdapter(),
  new TheGraphProviderAdapter(),
]

/**
 * Registers every adapter in ALL_PROVIDER_ADAPTERS with the Backend API
 * Gateway (see features/backend-api/gateway). Not called from anywhere in
 * the app yet — a future milestone decides when/where to invoke this.
 */
export function registerAllProviderAdapters(): void {
  for (const adapter of ALL_PROVIDER_ADAPTERS) {
    registerProvider(adapter)
  }
}
