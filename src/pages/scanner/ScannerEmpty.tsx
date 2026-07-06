import { FiSearch } from "react-icons/fi"
import { EmptyState } from "../../components/shared/EmptyState"

/**
 * Page-level wrapper around the shared EmptyState component, shown when no
 * Scanner Integration request has been supplied yet. Presentation only —
 * reuses the existing shared primitive rather than duplicating its markup
 * (see pages/recommendation/RecommendationEmpty.tsx for the same pattern).
 */
export function ScannerEmpty() {
  return (
    <EmptyState
      icon={FiSearch}
      title="No scan yet"
      description="Run the Scanner Integration flow for a query to see its search match, identity, token scan, cross-chain opportunity, and recommendation here."
    />
  )
}
