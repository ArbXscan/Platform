import { getExplorer } from "../../../../constants/explorers"
import type { OpportunityAlertInput } from "../../types"

function formatUsd(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "N/A"
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function formatPercent(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "N/A"
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

/** Escapes MarkdownV2 special characters per Telegram's Bot API formatting rules. */
function escapeMarkdown(value: string): string {
  return value.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1")
}

/**
 * Formats one alert into a Telegram MarkdownV2 message. Includes every
 * field the alert format requires: token, buy/sell chain, buy/sell DEX,
 * spread, ROI, estimated profit, liquidity, recommendation, confidence,
 * risk, and timestamp — plus an Explorer link (constants/explorers.ts,
 * only when that chain has one registered) and a DexScreener search link
 * (dexscreener.com/search, a real, documented DexScreener feature — not a
 * guessed pair-page URL, since this alert only has a token address, not a
 * pair address).
 */
export function formatTelegramMessage(input: OpportunityAlertInput): string {
  const { opportunity, profit, recommendation } = input

  const lines = [
    `*${escapeMarkdown(opportunity.symbol)}* \\- ${escapeMarkdown(recommendation.recommendation)}`,
    "",
    `Token: \`${escapeMarkdown(opportunity.token)}\``,
    `Buy Chain: ${escapeMarkdown(opportunity.sourceChain)}`,
    `Sell Chain: ${escapeMarkdown(opportunity.destinationChain)}`,
    `Buy DEX: ${escapeMarkdown(opportunity.sourceDex)}`,
    `Sell DEX: ${escapeMarkdown(opportunity.destinationDex)}`,
    `Spread: ${escapeMarkdown(formatPercent(opportunity.spreadPercent))}`,
    `ROI: ${escapeMarkdown(formatPercent(profit.roiPercent))}`,
    `Est\\. Profit: ${escapeMarkdown(formatUsd(profit.netProfitUsd))}`,
    `Liquidity: ${escapeMarkdown(formatUsd(opportunity.liquidity))}`,
    `Recommendation: ${escapeMarkdown(recommendation.recommendation)}`,
    `Confidence: ${recommendation.confidenceScore}/100`,
    `Risk: ${escapeMarkdown(recommendation.riskLevel)}`,
    `Time: ${escapeMarkdown(opportunity.timestamp)}`,
  ]

  const explorer = getExplorer(opportunity.sourceChain)
  if (explorer) {
    lines.push(`[Explorer](${explorer.addressUrl(opportunity.token)})`)
  }
  lines.push(`[DexScreener](https://dexscreener.com/search?q=${encodeURIComponent(opportunity.token)})`)

  return lines.join("\n")
}
