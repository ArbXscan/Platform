import type { DataSourceMeta } from "../../types/api"

const CONFIDENCE_STYLES: Record<DataSourceMeta["confidence"], string> = {
  high: "bg-emerald-400/10 text-emerald-300",
  medium: "bg-amber-400/10 text-amber-300",
  low: "bg-orange-400/10 text-orange-300",
  unknown: "bg-slate-400/10 text-slate-400",
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

export function SourceBadge({ source }: { source: DataSourceMeta }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${CONFIDENCE_STYLES[source.confidence]}`}
      title={`Source: ${source.provider} · Confidence: ${source.confidence} · Fetched ${timeAgo(source.fetchedAt)}`}
    >
      {source.provider} · {timeAgo(source.fetchedAt)}
    </span>
  )
}
