import type { RiskComponent, RiskLevel, RiskReport } from "../../features/recommendation/risk-engine"

interface RiskCardProps {
  risk: RiskReport
}

const LEVEL_STYLES: Record<RiskLevel, string> = {
  low: "bg-emerald-400/10 text-emerald-300",
  medium: "bg-amber-400/10 text-amber-300",
  high: "bg-red-400/10 text-red-300",
  unknown: "bg-slate-400/10 text-slate-400",
}

function RiskRow({ label, component }: { label: string; component: RiskComponent }) {
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[component.level]}`}>
          {component.level}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-slate-600">{component.reason}</p>
    </div>
  )
}

/**
 * Presentation-only breakdown of a RiskReport's five components. Renders
 * whatever the risk engine produced — no risk scoring or thresholds happen
 * here.
 */
export function RiskCard({ risk }: RiskCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Risk Assessment</h3>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[risk.overallLevel]}`}
        >
          {risk.overallLevel}
        </span>
      </div>
      <div className="mt-2 divide-y divide-white/5">
        <RiskRow label="Liquidity" component={risk.liquidity} />
        <RiskRow label="Slippage" component={risk.slippage} />
        <RiskRow label="Bridge" component={risk.bridge} />
        <RiskRow label="Execution" component={risk.execution} />
        <RiskRow label="Volatility" component={risk.volatility} />
      </div>
    </div>
  )
}
