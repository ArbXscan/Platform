import { scanTokenAddress } from "../../token-scanner"
import type { TokenScanResult } from "./types"

/**
 * Stage 1: Contract Address Scanner, executed as-is. No address-format logic
 * lives here — it only forwards to the existing scanner and returns its
 * result untouched.
 */
export function runTokenScanStage(address: string): TokenScanResult {
  return scanTokenAddress(address)
}
