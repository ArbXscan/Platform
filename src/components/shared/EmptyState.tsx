import type { IconType } from "react-icons"
import { FiInbox } from "react-icons/fi"

interface EmptyStateProps {
  icon?: IconType
  title: string
  description?: string
}

export function EmptyState({ icon: Icon = FiInbox, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Icon className="text-3xl text-slate-600" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {description && <p className="max-w-sm text-xs text-slate-600">{description}</p>}
    </div>
  )
}
