import { useCallback, useState } from "react"
import { verifyOpportunity } from "../features/verification/verification.service"
import type { AsyncStatus } from "../types/api"
import type { ArbitrageOpportunity } from "../types/arbitrage"
import type { OpportunityVerification } from "../types/verification"

/**
 * Runs an on-demand quote re-check for a single ArbitrageOpportunity.
 * Unlike hooks/useArbitrage.ts, this does not poll on an interval and does not
 * read/write a Zustand store — verification only makes sense when explicitly
 * triggered (e.g. right before a user acts on an opportunity), so the result
 * is owned locally by this hook. A dedicated store can be introduced later if
 * verification needs to be cached/shared across components.
 */
export function useVerifyOpportunity() {
  const [result, setResult] = useState<OpportunityVerification | null>(null)
  const [status, setStatus] = useState<AsyncStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (opportunity: ArbitrageOpportunity) => {
    setStatus("loading")
    setError(null)
    try {
      const verification = await verifyOpportunity(opportunity)
      setResult(verification)
      setStatus("success")
      return verification
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to verify opportunity"
      setError(message)
      setStatus("error")
      return undefined
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setStatus("idle")
    setError(null)
  }, [])

  return { result, status, error, verify, reset }
}
