import { create } from "zustand"
import type { AsyncStatus } from "../types/api"
import type { TokenDetail, TokenSearchResult } from "../types/token"

interface TokenState {
  searchResults: TokenSearchResult[]
  searchStatus: AsyncStatus

  currentToken: TokenDetail | null
  detailStatus: AsyncStatus
  error: string | null

  setSearchResults: (results: TokenSearchResult[]) => void
  setSearchStatus: (status: AsyncStatus) => void
  setCurrentToken: (token: TokenDetail | null) => void
  setDetailStatus: (status: AsyncStatus) => void
  setError: (error: string | null) => void
}

/**
 * Skeleton only — Step 2 (Token Search + Detail) wires this up to
 * features/token/token.service.ts via hooks/useToken.ts.
 */
export const useTokenStore = create<TokenState>((set) => ({
  searchResults: [],
  searchStatus: "idle",

  currentToken: null,
  detailStatus: "idle",
  error: null,

  setSearchResults: (results) => set({ searchResults: results, searchStatus: "success" }),
  setSearchStatus: (status) => set({ searchStatus: status }),
  setCurrentToken: (token) => set({ currentToken: token, detailStatus: "success" }),
  setDetailStatus: (status) => set({ detailStatus: status }),
  setError: (error) => set({ error, detailStatus: "error" }),
}))
