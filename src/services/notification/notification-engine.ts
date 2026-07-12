import { DEFAULT_NOTIFICATION_ENGINE_CONFIG } from "./config"
import type { NotificationEngineConfig } from "./config"
import { createAlertDeduplicator } from "./dedupe"
import type { AlertDeduplicator } from "./dedupe"
import { createAlertQueue } from "./queue"
import type { AlertQueue } from "./queue"
import { matchesAlertRules } from "./rules"
import type { NotificationAdapter, OpportunityAlertInput } from "./types"

export interface NotificationEngine {
  /**
   * Evaluates a fresh batch of opportunities — the exact objects
   * detectCrossChainOpportunities(), calculateArbitrageProfit(), and
   * generateCrossChainRecommendation() already produced — against the
   * configured alert rules, and enqueues the ones that qualify and aren't
   * on cooldown. Never recalculates spread, profit, or recommendation
   * data, and never sends anything directly; qualifying opportunities only
   * ever enter the queue.
   */
  evaluate(inputs: OpportunityAlertInput[]): void
  queue: AlertQueue
  deduplicator: AlertDeduplicator
}

/**
 * Creates the central Notification Engine for ArbXscan. Channel-
 * independent by construction: it knows nothing about Telegram, Discord,
 * Slack, Email, Webhook, or Push — it only holds whichever
 * NotificationAdapter[] it's given and lets the queue deliver through
 * them. Adding a new channel means writing a new adapter (see
 * adapters/telegram/ for the reference implementation) and passing an
 * instance of it in here; this file never needs to change for that.
 *
 * Does not fetch, poll, or scan anything itself — evaluate() is meant to
 * be called with data produced by an existing refresh cycle (e.g. the Live
 * Market Feed via hooks/useCrossChainArbitrage.ts), never by a loop this
 * engine owns.
 */
export function createNotificationEngine(
  adapters: NotificationAdapter[],
  config: NotificationEngineConfig = DEFAULT_NOTIFICATION_ENGINE_CONFIG,
): NotificationEngine {
  const deduplicator = createAlertDeduplicator(config.deduplication.cooldownSeconds)
  const queue = createAlertQueue(adapters, config.queue)

  function evaluate(inputs: OpportunityAlertInput[]) {
    for (const input of inputs) {
      if (!matchesAlertRules(input, config.rules)) continue
      if (deduplicator.isOnCooldown(input)) continue

      // Marked before the send even starts (not after "sent") so the same
      // opportunity showing up again in the very next refresh cycle, while
      // this one is still queued/sending/retrying, isn't enqueued a second
      // time.
      deduplicator.markAlerted(input)
      queue.enqueue(input)
    }
  }

  return { evaluate, queue, deduplicator }
}
