import { useEffect, useState } from "react"
import { RecommendationCard } from "../../components/recommendation"
import { runRecommendationPipeline } from "../../features/recommendation/pipeline"
import type { RecommendationPipelineInput, RecommendationPipelineResult } from "../../features/recommendation/pipeline"
import type { AsyncStatus } from "../../types/api"
import { RecommendationEmpty } from "./RecommendationEmpty"
import { RecommendationLoader } from "./RecommendationLoader"

/** Pre-resolved action links (e.g. from DexActionPanel/bridge-registry) passed through to OpenActions, unmodified. */
export interface RecommendationActionLinks {
  buyDexUrl?: string
  buyDexLabel?: string
  sellDexUrl?: string
  sellDexLabel?: string
  bridgeUrl?: string
  bridgeLabel?: string
}

interface RecommendationContentProps {
  /** Already-normalized input for the Recommendation Pipeline. Undefined shows the empty state — this component never fabricates one. */
  pipelineInput?: RecommendationPipelineInput
  actions?: RecommendationActionLinks
}

/**
 * Runs the existing Recommendation Pipeline for the given input and renders
 * its result. This component performs no calculation of its own — every
 * risk, spread, score, confidence, and recommendation value comes directly
 * from runRecommendationPipeline(); this only manages the
 * loading/empty/error presentation around that single call. State is local
 * component state only — no React Context, no global store.
 */
export function RecommendationContent({ pipelineInput, actions }: RecommendationContentProps) {
  const [result, setResult] = useState<RecommendationPipelineResult | null>(null)
  const [status, setStatus] = useState<AsyncStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pipelineInput) {
      setResult(null)
      setStatus("idle")
      setError(null)
      return
    }

    let cancelled = false
    setStatus("loading")
    setError(null)

    runRecommendationPipeline(pipelineInput)
      .then((pipelineResult) => {
        if (cancelled) return
        setResult(pipelineResult)
        setStatus("success")
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to run the Recommendation Pipeline.")
        setStatus("error")
      })

    return () => {
      cancelled = true
    }
  }, [pipelineInput])

  if (!pipelineInput || status === "idle") {
    return <RecommendationEmpty />
  }

  if (status === "loading") {
    return <RecommendationLoader />
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
        Couldn't generate a recommendation: {error}
      </div>
    )
  }

  if (!result) {
    return <RecommendationEmpty />
  }

  return (
    <RecommendationCard recommendation={result.recommendation} scoring={result.scoring} risk={result.risk} actions={actions} />
  )
}
