import { FiExternalLink } from "react-icons/fi"
import { Tooltip } from "../ui/Tooltip"

const actionButtonClass =
  "inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"

interface OpenActionProps {
  label: string
  url?: string
  disabledReason?: string
}

function OpenAction({ label, url, disabledReason }: OpenActionProps) {
  if (!url) {
    return (
      <Tooltip content={disabledReason ?? `${label} is not available yet.`}>
        <button type="button" disabled aria-disabled="true" className={actionButtonClass}>
          <FiExternalLink aria-hidden="true" />
          {label}
        </button>
      </Tooltip>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={actionButtonClass}>
      <FiExternalLink aria-hidden="true" />
      {label}
    </a>
  )
}

interface OpenActionsProps {
  buyDexUrl?: string
  buyDexLabel?: string
  buyDexDisabledReason?: string
  sellDexUrl?: string
  sellDexLabel?: string
  sellDexDisabledReason?: string
  bridgeUrl?: string
  bridgeLabel?: string
  bridgeDisabledReason?: string
}

/**
 * Presentation-only row of Buy DEX / Bridge / Sell DEX actions. Every URL
 * and label is supplied by the caller — this component builds no link,
 * looks up no registry, and performs no validation of its own. A missing
 * URL renders a disabled button with an explanatory tooltip rather than a
 * guessed link.
 */
export function OpenActions({
  buyDexUrl,
  buyDexLabel = "Open Buy DEX",
  buyDexDisabledReason,
  sellDexUrl,
  sellDexLabel = "Open Sell DEX",
  sellDexDisabledReason,
  bridgeUrl,
  bridgeLabel = "Open Bridge",
  bridgeDisabledReason,
}: OpenActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <OpenAction label={buyDexLabel} url={buyDexUrl} disabledReason={buyDexDisabledReason} />
      <OpenAction label={bridgeLabel} url={bridgeUrl} disabledReason={bridgeDisabledReason} />
      <OpenAction label={sellDexLabel} url={sellDexUrl} disabledReason={sellDexDisabledReason} />
    </div>
  )
}
