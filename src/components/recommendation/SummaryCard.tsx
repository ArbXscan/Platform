interface SummaryCardProps {
  summary: string
}

/**
 * Presentation-only display of the Recommendation Engine's summary sentence.
 * Renders the string as given — no summarization happens here.
 */
export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-medium text-white">Summary</h3>
      <p className="mt-2 text-sm text-slate-300">{summary}</p>
    </div>
  )
}
