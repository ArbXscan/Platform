import { FiExternalLink } from "react-icons/fi"
import { findDex } from "../../registry/dex"
import type { ArbitrageOpportunity } from "../../types/arbitrage"
import { Tooltip } from "../ui/Tooltip"
import { CopyButton } from "./CopyButton"

interface DexActionPanelProps {
  opportunity: ArbitrageOpportunity
  className?: string
}

function buildUrl(template: string, chainId: string, tokenAddress: string): string {
  return template.replace("{chainId}", chainId).replace("{tokenAddress}", tokenAddress)
}

const actionButtonClass =
  "inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"

interface DexLinkActionProps {
  label: string
  url: string | undefined
  disabledReason: string
}

/**
 * A single external-link action. Renders a disabled button with an
 * explanatory tooltip when no URL could be built from registry data, instead
 * of ever falling back to a guessed link.
 */
function DexLinkAction({ label, url, disabledReason }: DexLinkActionProps) {
  if (!url) {
    return (
      <Tooltip content={disabledReason}>
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

/**
 * Displays the available user actions for an already-detected ArbitrageOpportunity:
 * opening the buy/sell DEX's swap page, viewing the token contract via a DEX's
 * explorer link, and copying the contract address. Every link is built strictly
 * from DEX Registry metadata (registry/dex) — never guessed. If a DEX isn't in
 * the registry, or the registry doesn't yet have the specific URL template an
 * action needs, that action is disabled instead of pointing somewhere wrong.
 *
 * Fully decoupled from the Arbitrage Engine and Verification Layer — reads only
 * the fields it needs off an already-finished ArbitrageOpportunity, and never
 * imports from features/arbitrage or features/verification.
 */
export function DexActionPanel({ opportunity, className = "" }: DexActionPanelProps) {
  const buyDex = findDex(opportunity.buyFrom.exchange)
  const sellDex = findDex(opportunity.sellTo.exchange)

  const buySwapUrl = buyDex?.swapUrlTemplate
    ? buildUrl(buyDex.swapUrlTemplate, opportunity.buyFrom.chainId, opportunity.token.address)
    : undefined
  const sellSwapUrl = sellDex?.swapUrlTemplate
    ? buildUrl(sellDex.swapUrlTemplate, opportunity.sellTo.chainId, opportunity.token.address)
    : undefined

  // "View Contract" prefers the buy-side DEX's explorer template, falling back
  // to the sell-side one if only that DEX has one confirmed.
  const explorerDex = buyDex?.explorerUrlTemplate ? buyDex : sellDex?.explorerUrlTemplate ? sellDex : undefined
  const contractUrl = explorerDex?.explorerUrlTemplate
    ? buildUrl(explorerDex.explorerUrlTemplate, opportunity.token.chainId, opportunity.token.address)
    : undefined

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <DexLinkAction
        label="Open Buy DEX"
        url={buySwapUrl}
        disabledReason={
          buyDex
            ? `A swap link isn't available yet for ${buyDex.name}.`
            : `"${opportunity.buyFrom.exchange}" isn't in the DEX Registry yet.`
        }
      />
      <DexLinkAction
        label="Open Sell DEX"
        url={sellSwapUrl}
        disabledReason={
          sellDex
            ? `A swap link isn't available yet for ${sellDex.name}.`
            : `"${opportunity.sellTo.exchange}" isn't in the DEX Registry yet.`
        }
      />
      <DexLinkAction
        label="View Contract"
        url={contractUrl}
        disabledReason="An explorer link isn't available yet for this token's DEXs."
      />
      <CopyButton value={opportunity.token.address} label="Copy Contract Address" />
    </div>
  )
}