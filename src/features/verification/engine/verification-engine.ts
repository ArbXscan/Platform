

import type { ArbitrageOpportunity } from "../../../types/arbitrage"
import type {
  RouterQuoteAdapter,
  RouterQuoteRequest,
  RouterQuoteResponse,
  VerificationEngineResult,
} from "./types"

/** Registered router adapters, keyed by their canonical routerId (lowercase). */
const adapters: Map<string, RouterQuoteAdapter> = new Map()

/**
 * Registers a router adapter so the engine can use it for future requests.
 * No adapters are registered by default — Jupiter, 1inch, PancakeSwap,
 * Paraswap, OpenOcean, KyberSwap, and any future router are added here by a
 * later milestone, without this engine or any UI code needing to change.
 */
export function registerRouterAdapter(adapter: RouterQuoteAdapter): void {
  adapters.set(adapter.routerId.toLowerCase(), adapter)
}

/** Removes a previously registered adapter. Mainly useful for tests. */
export function unregisterRouterAdapter(routerId: string): void {
  adapters.delete(routerId.toLowerCase())
}

/** Returns the canonical ids of every currently registered adapter. */
export function getRegisteredRouterIds(): string[] {
  return Array.from(adapters.keys())
}

function buildRequest(opportunity: ArbitrageOpportunity, side: "buy" | "sell"): RouterQuoteRequest {
  const leg = side === "buy" ? opportunity.buyFrom : opportunity.sellTo
  return {
    routerId: leg.exchange,
    chainId: leg.chainId,
    tokenAddress: opportunity.token.address,
    side,
  }
}

async function runQuote(request: RouterQuoteRequest): Promise<RouterQuoteResponse> {
  const fetchedAt = new Date().toISOString()
  const adapter = adapters.get(request.routerId.toLowerCase())

  if (!adapter) {
    return {
      routerId: request.routerId,
      status: "unsupported",
      message: `No router adapter registered for "${request.routerId}" yet.`,
      fetchedAt,
    }
  }

  if (!adapter.supportsChain(request.chainId)) {
    return {
      routerId: request.routerId,
      status: "unsupported",
      message: `"${request.routerId}" does not support chain "${request.chainId}".`,
      fetchedAt,
    }
  }

  try {
    return await adapter.getQuote(request)
  } catch (err) {
    return {
      routerId: request.routerId,
      status: "error",
      message: err instanceof Error ? err.message : "Router adapter request failed.",
      fetchedAt,
    }
  }
}

/**
 * Runs the Verification Engine against one ArbitrageOpportunity, producing a
 * normalized result for both its buy and sell legs. Provider-agnostic: it
 * never imports a specific router's SDK/API — it only calls whichever
 * adapter is registered for each leg's exchange id. If no adapter is
 * registered (the case for every router today, since none are implemented
 * yet), the leg's quote comes back with status "unsupported" rather than a
 * guessed value.
 *
 * Fully decoupled from features/arbitrage, features/verification's existing
 * DexScreener-based re-quote check, and every UI component — it is not
 * called from anywhere yet.
 */
export async function runVerificationEngine(opportunity: ArbitrageOpportunity): Promise<VerificationEngineResult> {
  const requestedAt = new Date().toISOString()
  const [buyQuote, sellQuote] = await Promise.all([
    runQuote(buildRequest(opportunity, "buy")),
    runQuote(buildRequest(opportunity, "sell")),
  ])

  return {
    opportunityId: opportunity.id,
    requestedAt,
    buyQuote,
    sellQuote,
  }
}