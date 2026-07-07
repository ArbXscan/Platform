import { requestProviderDataWithFallback } from "../backend-api"
import type { ProviderDataResponse, StageResult } from "./types"

/**
 * Optional Backend API stage: looks up raw market-data provider status for
 * the resolved asset via the Backend API Gateway's priority/fallback
 * resolution (features/backend-api). This is supplementary telemetry
 * only — it never replaces or feeds into the existing cross-chain /
 * recommendation snapshot data (that shape and its normalization logic
 * belongs to features/recommendation/integration and is not duplicated
 * here). No HTTP call happens in this file; the gateway owns that.
 */
export async function runBackendApiStage(
  chainId: string,
  identifier: string,
): Promise<StageResult<ProviderDataResponse>> {
  const response = await requestProviderDataWithFallback({
    category: "market-data",
    chainId,
    identifier,
  })

  if (response.status !== "ok") {
    return { status: "failed", data: response }
  }

  return { status: "success", data: response }
}
