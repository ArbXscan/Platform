import { resolveTelegramConfig } from "./telegram-config"
import { formatTelegramMessage } from "./telegram-formatter"
import type { TelegramAdapterConfig } from "./types"
import type { NotificationAdapter, NotificationAlert } from "../../types"

const TELEGRAM_API_BASE_URL = "https://api.telegram.org"

/**
 * Telegram channel adapter. Implements the channel-independent
 * NotificationAdapter contract (services/notification/types.ts) — nothing
 * outside this folder knows this adapter sends via Telegram specifically,
 * and this file is the only place Telegram's API shape is referenced.
 *
 * Sends a real message through Telegram's Bot API — no mocked request. If
 * credentials aren't configured (see telegram-config.ts), send() rejects
 * with a clear error; it never silently pretends to succeed.
 */
export class TelegramAdapter implements NotificationAdapter {
  readonly channel = "telegram"

  constructor(private readonly config?: TelegramAdapterConfig) {}

  async send(alert: NotificationAlert): Promise<void> {
    const resolved = this.config ?? resolveTelegramConfig()
    if (!resolved) {
      throw new Error("Telegram is not configured: set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID.")
    }

    const apiBaseUrl = resolved.apiBaseUrl ?? TELEGRAM_API_BASE_URL
    const url = `${apiBaseUrl}/bot${resolved.botToken}/sendMessage`
    const text = formatTelegramMessage(alert.input)

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: resolved.chatId,
        text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => "")
      throw new Error(`Telegram API request failed (${response.status}): ${body}`)
    }
  }
}
