import type { DexInfo } from "./types"

/**
 * Seed list of DEXs ArbXscan recognizes. Kept as a flat list, not a nested or
 * abstracted structure — per the same "this is a data file, not a framework"
 * convention used in registry/assets/data.ts. Extendable: add an entry here,
 * nothing else needs to change.
 *
 * swapUrlTemplate is only set where the query-parameter format has been
 * confirmed against that DEX's own documentation. Where it hasn't been
 * confirmed yet, it's left undefined rather than guessed.
 */
export const KNOWN_DEXES: DexInfo[] = [
  {
    id: "uniswap",
    name: "Uniswap",
    chainIds: ["ethereum", "arbitrum", "base"],
    websiteUrl: "https://uniswap.org",
    swapUrlTemplate: "https://app.uniswap.org/swap?chain={chainId}&outputCurrency={tokenAddress}",
    status: "active",
  },
  {
    id: "pancakeswap",
    name: "PancakeSwap",
    chainIds: ["bnb"],
    websiteUrl: "https://pancakeswap.finance",
    status: "active",
  },
  {
    id: "quickswap",
    name: "QuickSwap",
    chainIds: ["polygon"],
    websiteUrl: "https://quickswap.exchange",
    swapUrlTemplate: "https://quickswap.exchange/#/swap?outputCurrency={tokenAddress}",
    status: "active",
  },
  {
    id: "velodrome",
    name: "Velodrome",
    chainIds: ["optimism"],
    websiteUrl: "https://velodrome.finance",
    status: "active",
  },
  {
    id: "traderjoe",
    name: "Trader Joe",
    chainIds: ["avalanche"],
    websiteUrl: "https://traderjoexyz.com",
    status: "active",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    chainIds: ["solana"],
    websiteUrl: "https://jup.ag",
    status: "active",
  },
  {
    id: "raydium",
    name: "Raydium",
    chainIds: ["solana"],
    websiteUrl: "https://raydium.io",
    status: "active",
  },
]