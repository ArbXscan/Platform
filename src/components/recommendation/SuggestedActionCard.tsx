import { FiCheckCircle } from "react-icons/fi"

interface SuggestedActionCardProps {
  actions: string[]
}

/**
 * Presentation-only list of suggested next steps. Renders nothing when
 * there are none — it never invents a suggestion of its own.
 */
export function SuggestedActionCard({ actions }: SuggestedActionCardProps) {
  if (actions.length === 0) return null

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-medium text-white">Suggested Actions</h3>
      <ul className="mt-2 space-y-1.5">
        {actions.map((action, i) => (
          <li key={i} className="flex items-start gap-1.5 text-sm text-slate-300">
            <FiCheckCircle className="mt-0.5 shrink-0 text-slate-600" aria-hidden="true" />
            {action}
          </li>
        ))}
      </ul>
    </div>
  )
}
