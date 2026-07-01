import { create } from "zustand"

interface AppState {
  /** Global chain filter, applied across dashboard/token/arbitrage/market when set. `null` = all chains. */
  activeChainId: string | null
  setActiveChainId: (chainId: string | null) => void
}

/**
 * Only for state genuinely shared across features. Component-local UI state
 * (e.g. the Sidebar's mobile drawer open/closed) stays as useState in that
 * component instead — see docs/CODING_STANDARTS.md on not over-globalizing state.
 */
export const useAppStore = create<AppState>((set) => ({
  activeChainId: null,
  setActiveChainId: (chainId) => set({ activeChainId: chainId }),
}))
