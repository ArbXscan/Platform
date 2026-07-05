import { scanAddress } from "./scanner"
import type { TokenScanResult } from "./types"

/**
 * The primary public entry point of the Contract Address Scanner. Scans a
 * single raw address string and returns its normalized TokenScanResult.
 * Format-level only: no market data, arbitrage, or recommendation logic is
 * involved, and no existing engine is called.
 */
export function scanTokenAddress(raw: string): TokenScanResult {
  return scanAddress(raw)
}

/**
 * Scans multiple raw address strings in one call, preserving input order.
 * Each address is scanned independently — one invalid address never affects
 * the result for another.
 */
export function scanTokenAddresses(rawAddresses: string[]): TokenScanResult[] {
  return rawAddresses.map((raw) => scanAddress(raw))
}
