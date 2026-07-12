/**
 * Extension point for a real-time WebSocket transport.
 *
 * Neither provider this app already integrates with offers a public
 * WebSocket that streams the price/liquidity data the Live Market Feed
 * actually needs:
 *  - DexScreener's public WebSocket API (docs.dexscreener.com/api/websockets)
 *    streams token-profile, boost, and community-takeover events only — not
 *    pair price or liquidity updates, which is what services/providers/dexscreener.ts
 *    (searchPairs/getPairsForToken) actually reads.
 *  - GeckoTerminal's public API (services/providers/geckoterminal.ts) is
 *    REST-only; it has no documented public WebSocket endpoint.
 *
 * Rather than fabricate a connection to a stream that doesn't carry the
 * data we need, this honestly reports "not available" so the feed always
 * uses the polling transport (poller.ts) today, exactly as required when no
 * provider WebSocket applies. If a provider adds a suitable one later, or a
 * paid/alternate feed is integrated, implement it behind this same
 * function — no caller of poller.ts needs to change.
 */
export function isWebSocketTransportAvailable(): boolean {
  return false
}
