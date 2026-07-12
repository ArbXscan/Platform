export type { NotificationAdapter, NotificationAlert, NotificationStatus, OpportunityAlertInput } from "./types"
export type {
  AlertDeduplicationConfig,
  AlertQueueConfig,
  AlertRulesConfig,
  NotificationEngineConfig,
} from "./config"
export { DEFAULT_NOTIFICATION_ENGINE_CONFIG, mergeNotificationEngineConfig } from "./config"
export { matchesAlertRules } from "./rules"
export type { AlertDeduplicator } from "./dedupe"
export { alertIdentityKey, createAlertDeduplicator } from "./dedupe"
export type { AlertQueue, AlertQueueListener } from "./queue"
export { createAlertQueue } from "./queue"
export type { NotificationEngine } from "./notification-engine"
export { createNotificationEngine } from "./notification-engine"
