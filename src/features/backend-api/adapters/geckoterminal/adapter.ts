import { GECKOTERMINAL_NETWORK_MAP, getTrendingPools } from "../../../../services/providers/geckoterminal"
import type { ProviderDataRequest, ProviderDataResponse } from "../../gateway/types"
import { BaseProviderAdapter } from "../base/adapter"

/**
 * GeckoTerminal (market data) adapter — wraps the existing, already-live
 * GeckoTerminal client (services/providers/geckoterminal.ts) so it can be
 * reached through the Backend API Gateway. This file makes no HTTP
 * requests of its own; every network call happens inside
 * services/providers/geckoterminal.ts (via services/api/client.ts),
 * unchanged and un-duplicated. Supported chains are read directly from
 * GECKOTERMINAL_NETWORK_MAP rather than a second, separately maintained list.
 */
export class GeckoTerminalProviderAdapter extends BaseProviderAdapter {
  readonly providerId = "geckoterminal"
  readonly category = "market-data" as const
  protected readonly supportedChainIds = Object.keys(GECKOTERMINAL_NETWORK_MAP)

  /**
   * Forwards to the existing getTrendingPools(chainId) call.
   * `request.identifier` is unused — GeckoTerminal's trending-pools
   * endpoint is per-network, not per-token. Returns every pool found,
   * unmodified — no filtering, ranking, or cross-provider normalization
   * happens here (features/market/market.service.ts already owns
   * normalizing this shape against DexScreener's, per that file's existing
   * design, and is not duplicated).
   */
  async getData(request: ProviderDataRequest): Promise<ProviderDataResponse> {
    const pools = await getTrendingPools(request.chainId)
    return {
      providerId: this.providerId,
      status: "ok",
      data: { pools },
      fetchedAt: new Date().toISOString(),
    }
  }
}
