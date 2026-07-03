interface SkeletonProps {
  className?: string
}

/** Base pulsing block. Compose with className to match the shape being loaded. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />
}

/** Row shaped like a StatCard, for the dashboard/stat grids while loading. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-7 w-16" />
    </div>
  )
}

/** A single table row shaped skeleton, for market/arbitrage tables while loading. */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[8rem]" />
        </td>
      ))}
    </tr>
  )
}
