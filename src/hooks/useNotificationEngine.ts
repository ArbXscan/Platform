import { useEffect, useRef } from "react"
import { createNotificationEngine, mergeNotificationEngineConfig } from "../services/notification"
import type { NotificationEngineConfig, OpportunityAlertInput } from "../services/notification"
import { TelegramAdapter } from "../services/notification/adapters/telegram"

/**
 * Thin React binding for the Notification Engine (services/notification).
 * Creates one engine instance for the component's lifetime (Telegram is
 * the only adapter wired in today — future channels are added by passing
 * more adapters into this same createNotificationEngine call, not by
 * changing the engine itself) and evaluates `inputs` — the already-
 * computed CrossChainOpportunity/ArbitrageProfit/CrossChainRecommendation
 * bundles the caller already has — every time they change.
 *
 * `inputs` only changes when the caller's own data actually changes (e.g.
 * useCrossChainArbitrage's `rows`, which only updates once per Live Market
 * Feed cycle), so this hook subscribes to that existing cadence rather
 * than creating any polling, scanning, or refresh loop of its own.
 */
export function useNotificationEngine(inputs: OpportunityAlertInput[], config?: Partial<NotificationEngineConfig>) {
  const engineRef = useRef<ReturnType<typeof createNotificationEngine> | null>(null)

  if (!engineRef.current) {
    engineRef.current = createNotificationEngine([new TelegramAdapter()], mergeNotificationEngineConfig(config))
  }

  useEffect(() => {
    engineRef.current?.evaluate(inputs)
  }, [inputs])

  return engineRef.current
}
