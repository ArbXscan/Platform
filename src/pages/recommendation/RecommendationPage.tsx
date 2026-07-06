import type { RecommendationPipelineInput } from "../../features/recommendation/pipeline"
import type { RecommendationActionLinks } from "./RecommendationContent"
import { RecommendationContent } from "./RecommendationContent"
import { RecommendationLayout } from "./RecommendationLayout"

interface RecommendationPageProps {
  /** Already-normalized input for the Recommendation Pipeline. Not wired to a route yet — a future integration supplies this. */
  pipelineInput?: RecommendationPipelineInput
  /** Pre-resolved action links to pass through to OpenActions. */
  actions?: RecommendationActionLinks
}

/**
 * Recommendation Page — renders the existing Recommendation Pipeline's
 * output for one opportunity. Presentation only: no risk, spread, score,
 * confidence, or recommendation calculation happens here or in any of this
 * page's sub-components; everything comes from
 * features/recommendation/pipeline. Not wired into routing or navigation yet.
 */
export default function RecommendationPage({ pipelineInput, actions }: RecommendationPageProps) {
  return (
    <RecommendationLayout>
      <RecommendationContent pipelineInput={pipelineInput} actions={actions} />
    </RecommendationLayout>
  )
}
