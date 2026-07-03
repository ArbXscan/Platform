export type AssetCategory = "layer1" | "layer2" | "stablecoin" | "oracle"

/**
 * Forward-compat hook for Milestone 3 (Recognized vs Supported separation).
 * No feature in this list is implemented yet — every asset in the registry
 * currently has an empty supportedFeatures array. This is intentionally just
 * the schema; wiring it to real Quote Verification / Arbitrage capability
 * checks is out of scope here.
 */
export type AssetFeature = "arbitrage-scanner" | "dex-intelligence" | "quote-verification"

/**
 * A globally important crypto asset ArbXscan recognizes by identity, independent
 * of whether any market-data provider currently supports it. Recognition here
 * is about identity only (name, symbol, category, reference links) — never
 * price, liquidity, or market cap. Those stay the responsibility of market
 * providers (DexScreener, GeckoTerminal) and are never stored here.
 */
export interface RecognizedAsset {
  /** Canonical internal id, lowercase, e.g. "bitcoin". */
  id: string
  name: string
  symbol: string
  /** Alternative search terms (ticker variants, common names). Does NOT include wrapped/bridged variant tickers (e.g. "wbtc" is a different asset, not an alias of "bitcoin"). */
  aliases?: string[]
  /** Maps to constants/chains.ts id, if this asset's native chain is one ArbXscan currently tracks. Undefined for assets whose native chain isn't in that list, or that aren't chain-native assets. */
  nativeChainId?: string
  category?: AssetCategory
  /** Always true for entries in this registry — kept explicit so a future "unofficial/community-submitted" tier can be added without changing this field's meaning. */
  isOfficial: true
  /** Feature-support flags — see AssetFeature. Empty today; populated as those systems land. */
  supportedFeatures: AssetFeature[]
  logoUrl?: string
  explorerUrl?: string
  websiteUrl?: string
}
