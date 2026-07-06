import { LoadingState } from "../../components/recommendation"

/**
 * Page-level wrapper around the existing recommendation LoadingState
 * component, shown while the Scanner Integration flow is running. The final
 * successful render ends in a RecommendationCard, so this skeleton (already
 * shaped like one) is reused as-is rather than building a second one.
 */
export function ScannerLoading() {
  return <LoadingState />
}
