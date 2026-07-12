/**
 * Telegram-specific configuration, read only from environment variables —
 * never hardcoded. See telegram-config.ts for how these are resolved.
 */
export interface TelegramAdapterConfig {
  botToken: string
  chatId: string
  /** Overridable Telegram Bot API base URL, for testing. Defaults to the real API in telegram-adapter.ts. */
  apiBaseUrl?: string
}
