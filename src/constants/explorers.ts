/**
 * Official block explorer per chain, used to build "View on Explorer" links from
 * a token contract address. One well-known explorer per chain — not exhaustive
 * (some chains have multiple), matching the same "seed list, extend later"
 * approach as constants/dex.ts.
 */
interface ExplorerInfo {
  name: string
  addressUrl: (address: string) => string
}

const EXPLORERS: Record<string, ExplorerInfo> = {
  ethereum: { name: "Etherscan", addressUrl: (a) => `https://etherscan.io/address/${a}` },
  solana: { name: "Solscan", addressUrl: (a) => `https://solscan.io/account/${a}` },
  arbitrum: { name: "Arbiscan", addressUrl: (a) => `https://arbiscan.io/address/${a}` },
  base: { name: "Basescan", addressUrl: (a) => `https://basescan.org/address/${a}` },
  bnb: { name: "BscScan", addressUrl: (a) => `https://bscscan.com/address/${a}` },
  polygon: { name: "PolygonScan", addressUrl: (a) => `https://polygonscan.com/address/${a}` },
  optimism: { name: "Optimistic Etherscan", addressUrl: (a) => `https://optimistic.etherscan.io/address/${a}` },
  avalanche: { name: "SnowTrace", addressUrl: (a) => `https://snowtrace.io/address/${a}` },
  // Domain verified via robinhood.com/us/en/support/articles/robinhood-chain-mainnet
  // and docs.robinhood.com/chain; /address/ path follows Blockscout's standard
  // route convention (the same explorer software family, same route shape as
  // any other Blockscout deployment).
  robinhood: { name: "Robinhood Chain Explorer", addressUrl: (a) => `https://robinhoodchain.blockscout.com/address/${a}` },
}

export function getExplorer(chainId: string): ExplorerInfo | undefined {
  return EXPLORERS[chainId]
}
