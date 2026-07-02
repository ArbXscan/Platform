import { create } from "zustand"
import type { AsyncStatus } from "../types/api"
import type { ArbitrageFilters, ArbitrageOpportunity } from "../types/arbitrage"

interface ArbitrageState {
  opportunities: ArbitrageOpportunity[]
  filters: ArbitrageFilters
  status: AsyncStatus
  error: string | null

  setOpportunities: (opportunities: ArbitrageOpportunity[]) => void
  setFilters: (filters: ArbitrageFilters) => void
  setStatus: (status: AsyncStatus) => void
  setError: (error: string | null) => void
}

/**
 * Skeleton only — Step 3 (Arbitrage Scanner) wires this up to
 * features/arbitrage/arbitrage.service.ts via hooks/useArbitrage.ts.
 */
export const useArbitrageStore = create<ArbitrageState>((set) => ({
  opportunities: [],
  filters: {},
  status: "idle",
  error: null,

  setOpportunities: (opportunities) => set({ opportunities, status: "success" }),
  setFilters: (filters) => set({ filters }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
}))
