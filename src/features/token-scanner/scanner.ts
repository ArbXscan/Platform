import { detectChains } from "./chain-detector"
import { tokenizeAddress } from "./tokenizer"
import type { ChainDetectionResult, TokenScanResult } from "./types"
import { validateAddress } from "./validator"

const NO_CHAINS_DETECTED: ChainDetectionResult = { candidates: [], isAmbiguous: false }

/**
 * Scans one raw address string: normalizes it, validates its format, and —
 * only if the format is valid — detects which supported chains it could
 * belong to. Performs no HTTP request, RPC call, or market-data lookup; this
 * only checks shape.
 */
export function scanAddress(raw: string): TokenScanResult {
  const tokenized = tokenizeAddress(raw)
  const validation = validateAddress(tokenized.normalized)
  const chainDetection = validation.status === "valid" ? detectChains(tokenized.normalized) : NO_CHAINS_DETECTED

  return {
    input: raw,
    tokenized,
    validation,
    chainDetection,
    scannedAt: new Date().toISOString(),
  }
}
