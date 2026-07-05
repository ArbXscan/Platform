import { FiActivity } from "react-icons/fi"
import { EmptyState as SharedEmptyState } from "../shared/EmptyState"

interface EmptyStateProps {
  title?: string
  description?: string
}

/**
 * Presentation-only empty state for when no recommendation has been
 * generated yet. Reuses the existing shared EmptyState primitive rather than
 * duplicating its markup.
 */
export function EmptyState({
  title = "No recommendation yet",
  description = "Run the Recommendation Pipeline for an opportunity to see its score, risk, and suggested actions here.",
}: EmptyStateProps) {
  return <SharedEmptyState icon={FiActivity} title={title} description={description} />
}
