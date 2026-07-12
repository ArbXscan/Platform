/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Telegram Bot API token for services/notification/adapters/telegram — read only from this env var, never hardcoded. */
  readonly VITE_TELEGRAM_BOT_TOKEN?: string
  /** Telegram chat id to post alerts to — read only from this env var, never hardcoded. */
  readonly VITE_TELEGRAM_CHAT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
