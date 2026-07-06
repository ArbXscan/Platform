import { runTokenScanStage as scanTokenAddress } from "../recommendation/integration"
import type { StageResult, TokenScanResult } from "./types"

/**
 * Stage 3: Token Scanner, executed as-is — via Recommendation Integration's
 * own thin wrapper around the same engine (runTokenScanStage), rather than
 * adding a second, separate direct dependency on features/token-scanner for
 * the same single call. No address-format logic is duplicated here.
 */
export function runScanStage(address: string): StageResult<TokenScanResult> {
  const tokenScan = scanTokenAddress(address)

  if (tokenScan.validation.status !== "valid") {
    return { status: "failed", data: tokenScan }
  }

  return { status: "success", data: tokenScan }
}
