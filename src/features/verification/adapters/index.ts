import { registerRouterAdapter } from "../engine"
import type { RouterQuoteAdapter } from "../engine"
import { JupiterRouterAdapter } from "./jupiter/adapter"
import { KyberSwapRouterAdapter } from "./kyberswap/adapter"
import { OneInchRouterAdapter } from "./oneinch/adapter"
import { OpenOceanRouterAdapter } from "./openocean/adapter"
import { PancakeSwapRouterAdapter } from "./pancakeswap/adapter"
import { ParaswapRouterAdapter } from "./paraswap/adapter"

export { BaseRouterAdapter } from "./base/adapter"
export { JupiterRouterAdapter } from "./jupiter/adapter"
export { KyberSwapRouterAdapter } from "./kyberswap/adapter"
export { OneInchRouterAdapter } from "./oneinch/adapter"
export { OpenOceanRouterAdapter } from "./openocean/adapter"
export { PancakeSwapRouterAdapter } from "./pancakeswap/adapter"
export { ParaswapRouterAdapter } from "./paraswap/adapter"

/**
 * Every router adapter currently available. All of them are stubs that
 * report "unsupported" (see base/adapter.ts) — none are registered with the
 * Verification Engine by default, and nothing in the app calls
 * registerAllRouterAdapters() yet. This module only defines the registry for
 * a future milestone to use.
 */
export const ALL_ROUTER_ADAPTERS: RouterQuoteAdapter[] = [
  new JupiterRouterAdapter(),
  new PancakeSwapRouterAdapter(),
  new OpenOceanRouterAdapter(),
  new ParaswapRouterAdapter(),
  new KyberSwapRouterAdapter(),
  new OneInchRouterAdapter(),
]

/**
 * Registers every adapter in ALL_ROUTER_ADAPTERS with the Verification
 * Engine (see features/verification/engine). Not called from anywhere in the
 * app yet — a future milestone decides when/where to invoke this.
 */
export function registerAllRouterAdapters(): void {
  for (const adapter of ALL_ROUTER_ADAPTERS) {
    registerRouterAdapter(adapter)
  }
}
