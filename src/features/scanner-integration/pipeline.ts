import { aggregateScannerOpportunities } from "./opportunity"
import { runScannerIntegration } from "./scanner-integration"
import type { ScannerIntegrationReport, ScannerIntegrationRequest, ScannerOpportunity } from "./types"

/**
 * Runs the full Scanner Integration flow for every request, independently.
 * Pure orchestration/fan-out — each request goes through the exact same
 * runScannerIntegration() used for a single request; no stage logic is
 * duplicated or re-implemented here. Requests run concurrently since they
 * are independent of each other.
 */
export async function runScannerPipeline(
  requests: ScannerIntegrationRequest[],
): Promise<ScannerIntegrationReport[]> {
  return Promise.all(requests.map((request) => runScannerIntegration(request)))
}

/**
 * Runs the full Scanner Integration flow for every request and normalizes
 * the successful ones into a single ScannerOpportunity list. Composition
 * of runScannerPipeline + aggregateScannerOpportunities only — no
 * additional calculation happens here.
 */
export async function runScannerPipelineForOpportunities(
  requests: ScannerIntegrationRequest[],
): Promise<ScannerOpportunity[]> {
  const reports = await runScannerPipeline(requests)
  return aggregateScannerOpportunities(reports)
}
