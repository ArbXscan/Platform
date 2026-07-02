import { create } from "zustand"
import type { AsyncStatus } from "../types/api"
import type { MarketSnapshot } from "../types/market"

interface MarketState {
  snapshot: MarketSnapshot | null
  status: AsyncStatus
  error: string | null

  setSnapshot: (snapshot: MarketSnapshot) => void
  setStatus: (status: AsyncStatus) => void
  setError: (error: string | null) => void
}

/**
 * Wired up in Step 1 to features/market/market.service.ts via hooks/useMarketData.ts.
 */
export const useMarketStore = create<MarketState>((set) => ({
  snapshot: null,
  status: "idle",
  error: null,

  setSnapshot: (snapshot) => set({ snapshot, status: "success", error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
}))
