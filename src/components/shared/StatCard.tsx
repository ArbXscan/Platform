import type { ReactNode } from "react"
import type { IconType } from "react-icons"

interface StatCardProps {
  label: string
  value: string
  hint?: ReactNode
  icon?: IconType
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[0.05]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        {Icon && <Icon className="text-slate-600 transition-colors group-hover:text-cyan-400" aria-hidden="true" />}
      </div>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
