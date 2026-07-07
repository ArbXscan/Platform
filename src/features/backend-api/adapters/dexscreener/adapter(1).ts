import { SUPPORTED_CHAINS } from "../../../../constants/chains"
import { getPairsForToken } from "../../../../services/providers/dexscreener"
import type { ProviderDataRequest, ProviderDataResponse } from "../../gateway/types"
import { BaseProviderAdapter } from "../base/adapter"

/**
 * DexScreener (market data) adapter — wraps the existing, already-live
 * DexScreener client (services/providers/dexscreener.ts) so it can be
 * reached through the Backend API Gateway. This file makes no HTTP
 * requests of its own; every network call happens inside
 * services/providers/dexscreener.ts (via services/api/client.ts),
 * unchanged and un-duplicated.
 */
export class DexScreenerProviderAdapter extends BaseProviderAdapter {
  readonly providerId = "dexscreener"
  readonly category = "market-data" as const
  protected readonly supportedChainIds = SUPPORTED_CHAINS.map((chain) => chain.id)

  /**
   * Treats `request.identifier` as a token contract address and forwards it
   * to the existing getPairsForToken(chainId, tokenAddress) call. Returns
   * every pair found, unmodified — no filtering, ranking, or "best pair"
   * selection happens here (that logic already exists in
   * features/verification/verification.service.ts and is not duplicated).
   */
  async getData(request: ProviderDataRequest): Promise<ProviderDataResponse> {
    const pairs = await getPairsForToken(request.chainId, request.identifier)
    return {
      providerId: this.providerId,
      status: "ok",
      data: { pairs },
      fetchedAt: new Date().toISOString(),
    }
  }
}
