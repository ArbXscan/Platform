import type { TelegramAdapterConfig } from "./types"

/**
 * Resolves Telegram credentials from environment variables only — never
 * hardcoded here or anywhere else in this adapter. Uses Vite's client-side
 * env mechanism (import.meta.env), which requires the VITE_ prefix:
 *   VITE_TELEGRAM_BOT_TOKEN
 *   VITE_TELEGRAM_CHAT_ID
 *
 * SECURITY NOTE: ArbXscan is a client-only SPA today (no backend yet — see
 * docs/ROADMAP.md). Any value read via import.meta.env.VITE_* is bundled
 * into the shipped JS and is visible to anyone who opens dev tools, so a
 * bot token configured this way should be treated as effectively public —
 * scope it to a bot that only posts to one channel, and be ready to rotate
 * it if abused. Once a Backend milestone exists, this adapter should call
 * your own backend endpoint (which holds the real secret server-side)
 * instead of calling Telegram's API directly from the browser.
 *
 * Returns undefined if either value isn't configured — this is never
 * defaulted to a placeholder string.
 */
export function resolveTelegramConfig(): TelegramAdapterConfig | undefined {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID

  if (!botToken || !chatId) return undefined

  return { botToken, chatId }
}
