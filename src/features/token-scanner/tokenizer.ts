import type { TokenizedAddress } from "./types"

/**
 * Normalizes raw input for scanning: trims whitespace, and for 0x-prefixed
 * (EVM/Sui/Aptos-style) addresses, lowercases the hex portion since hex
 * digits are case-insensitive. Base58 addresses (Solana) are case-sensitive,
 * so their casing is left untouched — lowercasing one would silently turn a
 * valid address into an invalid or different one.
 */
export function tokenizeAddress(raw: string): TokenizedAddress {
  const trimmed = raw.trim()
  const isHexPrefixed = /^0x/i.test(trimmed)
  const normalized = isHexPrefixed ? `0x${trimmed.slice(2).toLowerCase()}` : trimmed

  return {
    raw,
    normalized,
    wasModified: normalized !== raw,
  }
}
