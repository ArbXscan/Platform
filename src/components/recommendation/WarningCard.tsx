import { FiAlertTriangle } from "react-icons/fi"

interface WarningCardProps {
  warnings: string[]
}

/**
 * Presentation-only list of warnings. Renders nothing when there are none —
 * it never infers or adds a warning of its own.
 */
export function WarningCard({ warnings }: WarningCardProps) {
  if (warnings.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-amber-300">
        <FiAlertTriangle aria-hidden="true" />
        Warnings
      </h3>
      <ul className="mt-2 space-y-1.5">
        {warnings.map((warning, i) => (
          <li key={i} className="text-sm text-amber-200/80">
            {warning}
          </li>
        ))}
      </ul>
    </div>
  )
}
