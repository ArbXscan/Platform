import { create } from "zustand"
import type { AsyncStatus } from "../types/api"
import type { MarketOverview } from "../types/market"

interface MarketState {
  overview: MarketOverview | null
  status: AsyncStatus
  error: string | null

  setOverview: (overview: MarketOverview) => void
  setStatus: (status: AsyncStatus) => void
  setError: (error: string | null) => void
}

/**
 * Skeleton only — Step 1 (Dashboard) wires this up to features/market/market.service.ts
 * via hooks/useMarketData.ts. No fetching logic lives here.
 */
export const useMarketStore = create<MarketState>((set) => ({
  overview: null,
  status: "idle",
  error: null,

  setOverview: (overview) => set({ overview, status: "success", error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
}))
