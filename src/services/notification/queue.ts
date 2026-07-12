import type { AlertQueueConfig } from "./config"
import type { NotificationAdapter, NotificationAlert, NotificationStatus, OpportunityAlertInput } from "./types"

export type AlertQueueListener = (alert: NotificationAlert) => void

/**
 * Sequential, rate-limited alert delivery queue. enqueue/dequeue/retry/
 * discard as required; every alert is queued first and processed one at a
 * time by a background loop, never sent inline from enqueue(). Adapter
 * agnostic — it delivers through whichever NotificationAdapter[] it was
 * constructed with and has no idea what channel that is.
 */
export interface AlertQueue {
  /** Adds a new alert to the back of the queue and returns its id. Triggers processing if it isn't already running. */
  enqueue(input: OpportunityAlertInput): string
  /** Removes a still-pending (not yet sent/sending) alert from the queue. Returns false if it wasn't pending. */
  dequeue(id: string): boolean
  /** Re-enqueues a "failed" alert for another attempt. Returns false if the alert doesn't exist or isn't "failed". */
  retry(id: string): boolean
  /** Marks an alert as permanently abandoned and removes it from the pending queue if it's still there. Returns false once it's already "sent" or actively "sending". */
  discard(id: string, reason?: string): boolean
  getAlert(id: string): NotificationAlert | undefined
  listAlerts(): NotificationAlert[]
  /** Subscribes to every status change. Returns an unsubscribe function. */
  onStatusChange(listener: AlertQueueListener): () => void
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Creates an Alert Queue bound to `adapters`, using `config` for send
 * pacing (rate limiting) and retry behavior. Never blocks the calling
 * thread: all processing happens via async/setTimeout scheduling, and only
 * one send cycle runs at a time regardless of how many enqueue() calls
 * come in — this is what makes the queue safe at high volume (tens of
 * thousands of alerts/day) without flooding a channel's rate limit.
 */
export function createAlertQueue(adapters: NotificationAdapter[], config: AlertQueueConfig): AlertQueue {
  const alerts = new Map<string, NotificationAlert>()
  const pending: string[] = []
  const listeners = new Set<AlertQueueListener>()
  let processing = false
  let idCounter = 0

  function notify(alert: NotificationAlert) {
    for (const listener of listeners) listener(alert)
  }

  function updateStatus(alert: NotificationAlert, patch: Partial<NotificationAlert> & { status: NotificationStatus }) {
    Object.assign(alert, patch)
    notify(alert)
  }

  function removeFromPending(id: string): boolean {
    const index = pending.indexOf(id)
    if (index === -1) return false
    pending.splice(index, 1)
    return true
  }

  function scheduleProcessing() {
    if (processing) return
    processing = true
    void processNext()
  }

  async function processNext() {
    const id = pending.shift()
    if (id === undefined) {
      processing = false
      return
    }

    const alert = alerts.get(id)
    if (!alert || alert.status === "discarded") {
      void processNext()
      return
    }

    await sendWithRetry(alert)

    setTimeout(() => {
      void processNext()
    }, config.sendIntervalMs)
  }

  async function sendWithRetry(alert: NotificationAlert) {
    const attemptLimit = Math.max(1, config.retryCount)

    for (let attempt = alert.attempts + 1; attempt <= attemptLimit; attempt += 1) {
      updateStatus(alert, { status: "sending", attempts: attempt, lastAttemptAt: new Date().toISOString() })

      try {
        await Promise.all(adapters.map((adapter) => adapter.send(alert)))
        updateStatus(alert, { status: "sent" })
        return
      } catch (err) {
        const message = err instanceof Error ? err.message : "Notification send failed."
        if (attempt >= attemptLimit) {
          updateStatus(alert, { status: "failed", lastError: message })
          return
        }
        updateStatus(alert, { status: "queued", lastError: message })
        await delay(config.retryDelayMs)
      }
    }
  }

  return {
    enqueue(input) {
      idCounter += 1
      const id = `alert_${Date.now()}_${idCounter}`
      const alert: NotificationAlert = {
        id,
        input,
        status: "queued",
        attempts: 0,
        createdAt: new Date().toISOString(),
      }
      alerts.set(id, alert)
      pending.push(id)
      notify(alert)
      scheduleProcessing()
      return id
    },

    dequeue(id) {
      const alert = alerts.get(id)
      if (!alert || alert.status !== "queued") return false
      return removeFromPending(id)
    },

    retry(id) {
      const alert = alerts.get(id)
      if (!alert || alert.status !== "failed") return false
      alert.attempts = 0
      updateStatus(alert, { status: "queued" })
      pending.push(id)
      scheduleProcessing()
      return true
    },

    discard(id, reason) {
      const alert = alerts.get(id)
      if (!alert || alert.status === "sent" || alert.status === "sending") return false
      removeFromPending(id)
      updateStatus(alert, { status: "discarded", lastError: reason })
      return true
    },

    getAlert(id) {
      return alerts.get(id)
    },

    listAlerts() {
      return Array.from(alerts.values())
    },

    onStatusChange(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
