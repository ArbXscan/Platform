import { EmptyState } from "../../components/recommendation"

/**
 * Page-level wrapper around the shared EmptyState component, shown when no
 * pipeline input has been supplied yet. Presentation only.
 */
export function RecommendationEmpty() {
  return <EmptyState />
}
