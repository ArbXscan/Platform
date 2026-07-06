import { LoadingState } from "../../components/recommendation"

/**
 * Page-level wrapper around the shared LoadingState component, shown while
 * the Recommendation Pipeline is running. Presentation only.
 */
export function RecommendationLoader() {
  return <LoadingState />
}
