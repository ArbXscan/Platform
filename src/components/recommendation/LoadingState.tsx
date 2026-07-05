import { Skeleton } from "../ui/Skeleton"

/**
 * Presentation-only loading skeleton shaped like a RecommendationCard, shown
 * while the Recommendation Pipeline is running. No data or logic involved.
 */
export function LoadingState() {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  )
}
