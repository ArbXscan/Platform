import type { ArbitrageProfit, CrossChainOpportunity, CrossChainRecommendation } from "../../features/cross-chain"

/**
 * Channel-agnostic bundle the Notification Engine evaluates and formats —
 * the exact same three objects detectCrossChainOpportunities(),
 * calculateArbitrageProfit(), and generateCrossChainRecommendation()
 * already produced. Nothing here is recalculated.
 */
export interface OpportunityAlertInput {
  opportunity: CrossChainOpportunity
  profit: ArbitrageProfit
  recommendation: CrossChainRecommendation
}

export type NotificationStatus = "queued" | "sending" | "sent" | "failed" | "discarded"

/** One alert's full lifecycle record, as it moves through the queue. */
export interface NotificationAlert {
  id: string
  input: OpportunityAlertInput
  status: NotificationStatus
  attempts: number
  createdAt: string
  lastAttemptAt?: string
  lastError?: string
}

/**
 * Channel-independent contract every adapter implements — Telegram,
 * Discord, Slack, Email, Webhook, Push, or anything else. The queue
 * (queue.ts) and engine (notification-engine.ts) only ever depend on this
 * interface; they never know which concrete channel they're talking to.
 */
export interface NotificationAdapter {
  readonly channel: string
  send(alert: NotificationAlert): Promise<void>
}
