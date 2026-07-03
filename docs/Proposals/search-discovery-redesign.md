# Search & Discovery Redesign — Engineering Design Proposal

**Status:** Proposal — not implemented.
**Scope:** Token search/discovery UX and ranking. No pricing logic.

---

## 1. Problem Statement

The current search flow silently resolves an ambiguous query to a single token using a
liquidity-only heuristic, with no relevance weighting against the query itself. This produces
incorrect results for common queries (e.g. searching "Bitcoin" can resolve to an unrelated token
on Solana instead of a canonical BTC-pegged asset). For an analytics platform whose core value
proposition is data accuracy, an unannounced wrong-token resolution is a trust failure, not a
minor UX rough edge.

---

## 2. Current Search Flow Analysis

| Aspect | Current behavior |
|---|---|
| Data source | DexScreener `GET /latest/dex/search?q=` only. GeckoTerminal has no token search endpoint wired in. |
| Result selection | `pickPrimaryPair()` in `token.service.ts` selects the single pair with the highest `liquidity.usd` across **all** returned pairs, across **all** chains. |
| Relevance filtering | None. Symbol/name match against the query is never checked. |
| Result count | DexScreener typically returns dozens of pairs per query. All but one are discarded before reaching the UI. |
| Logo resolution | Correctly sourced from `pair.info.imageUrl`. Empty only when the provider omits the field for that specific pair — not a mapping defect. |
| Existing but unused infrastructure | `TokenSearchResult` (`types/token.ts`) and `searchResults` / `searchStatus` (`useTokenStore`) already exist in the codebase but were never wired to any service or component. |

---

## 3. Root Cause Analysis

The wrong-chain resolution symptom is a **consequence**, not an isolated bug. The underlying
defect is architectural: the current implementation has no concept of a *ranked result set* — it
conflates "find candidates" and "pick the answer" into a single liquidity-max reduction with zero
query-relevance signal. Any query with multiple legitimately distinct tokens sharing a name or
symbol (a normal occurrence in DeFi — USDC, USDT, and WETH all exist natively or as bridged
assets on most chains) will hit the same class of failure regardless of which token wins the
liquidity comparison.

---

## 4. Proposed User Experience

A two-tier UX backed by one shared ranking service and one shared result-card component:

- **Dropdown (fast path):** debounced live suggestions under the search input, top N candidates,
  keyboard-navigable.
- **Search Results Page (canonical path):** full ranked list at `/app/search?q=...`, used when the
  dropdown is insufficient (many candidates, or user explicitly requests the full list).

Both surfaces call the same `search.service.ts` ranking function and render the same
`SearchResultCard`, so ranking logic and card presentation are defined exactly once.

---

## 5. Search Result Ranking Strategy

Replace the single liquidity-max reduction with a weighted multi-factor score per candidate:

| Signal | Rationale | Relative weight |
|---|---|---|
| Exact symbol match | Strongest relevance signal; currently absent entirely. | Highest |
| Exact name match | Equally strong; covers name-based queries. | Highest |
| Prefix / partial match | Fallback when no exact match exists. | Medium |
| Liquidity (log-scaled) | Quality signal, but log-scaled so one outlier pool cannot dominate exact-match results. | Medium |
| 24h volume | Secondary activity signal; more susceptible to manipulation than liquidity. | Low |
| Pair completeness | Penalizes candidates missing logo/liquidity/price data — often indicates a new or unhealthy pool. | Low (penalty) |
| DEX prominence | A small per-chain allowlist of well-known DEXs receives a minor boost. | Low (bonus) |

**Design constraint:** exact-match signals must dominate the total score. Liquidity and volume
break ties *within* a relevance tier; they must never override a clear exact-match candidate in
favor of an irrelevant high-liquidity one — that is precisely the failure mode this redesign
corrects.

**Terminology note:** ranking score (query relevance) is a distinct concept from
`DataSourceMeta.confidence` (data trust, already used throughout the codebase). These must not be
conflated in implementation or in the UI.

**DEX prominence is a ranking signal only.** It must not be presented to the user as a security,
verification, or trust indicator.

Exact weight values are intentionally left undefined here; they should be tuned empirically
against real queries (BTC, USDC, PEPE, and known ambiguous cases) during implementation, not
fixed at design time.

---

## 6. Search Result Card Specification

| Field | Requirement | Rationale |
|---|---|---|
| Logo | Required | Fastest visual identification (`TokenLogo`, already implemented). |
| Name + Symbol | Required | Baseline identity. |
| Chain | Required | Primary disambiguator — the root cause of the current defect. |
| Liquidity | Required | Strongest available quality signal from DexScreener. |
| DEX | Optional | Tie-breaker when chain and liquidity are equivalent. |
| 24h Volume | Optional | Secondary activity signal. |
| Contract address (truncated) | Optional | For users who cross-check manually before selecting. |

**Explicitly excluded from the card:**
- **Price** — displaying price at the discovery stage risks it being mistaken for an execution
  price, which belongs exclusively to the Quote Verification Layer.
- **FDV / Market Cap** — level of detail appropriate for Token Detail, not for disambiguation.
- **Verified status** — DexScreener's API does not provide a verification field (confirmed against
  the `DexScreenerPair` type). Not implemented in this proposal; would require a manually curated
  allowlist as a separate product initiative.

---

## 7. Auto Navigation Rules

| Condition | Behavior |
|---|---|
| Query matches a full contract address format | Navigate directly to Token Detail. Addresses are unique by construction. |
| One candidate has a dominant exact-match score over all others | Navigate directly to Token Detail, with a persistent "Not the right token? View other results" affordance on the detail page. |
| Two or more candidates share a comparable top score | Show the result list. This is genuine ambiguity, not a ranking deficiency. |
| No exact match, only partial matches | Show the result list, ranked by score. |
| Zero results | Render the existing `EmptyState` component — a normal outcome, not an error state. |

---

## 8. Architecture Compatibility

**Search is an identity discovery feature only.** It resolves *which token* the user means —
address, chain, symbol, name, logo, and coarse liquidity/volume signals for ranking display. It
does not, and must never, compute or assert an execution-grade price.

Non-negotiable boundaries:
- **The Quote Verification Layer remains the sole pricing authority** for the entire application.
  Search must not introduce a second, competing notion of "the price."
- **The Arbitrage Engine remains architecturally independent from Search.** It may reuse
  `SearchResultCard` for its own token-selection UI, but ranking logic and pricing logic are not
  shared — reuse is limited to presentation.
- `TokenSearchResult` carries identity and coarse ranking signals only; it must not be extended
  with precise price fields. Precise pricing is exclusively the responsibility of
  `token.service.ts::getTokenDetail` today, and the Quote Verification Layer going forward.

This separation is what keeps the redesign forward-compatible: once the Quote Verification Layer
ships, it attaches to Token Detail (and later the Arbitrage Engine) without requiring any change
to Search.

---

## 9. File Impact

### New files
| File | Purpose |
|---|---|
| `src/features/search/search.service.ts` | Ranking algorithm (Section 5). |
| `src/hooks/useSearch.ts` | Debounced fetch lifecycle, wired to existing `useTokenStore` search state. |
| `src/components/shared/SearchResultCard.tsx` | Shared result card (Section 6), reusable by the future Arbitrage Engine. |
| `src/pages/search/SearchResultsPage.tsx` | Canonical results page at `/app/search`. |
| `src/components/shared/SearchDropdown.tsx` | Fast-path dropdown, keyboard nav pattern consistent with existing `components/ui/Select.tsx`. |

### Modified files
| File | Change |
|---|---|
| `src/router.tsx` | Add `/app/search` route. |
| `src/pages/dashboard/DashboardPage.tsx` | Wire search submit to the new flow (dropdown and/or results page) instead of direct navigation to Token Detail. |
| `src/types/token.ts` | Additive: possible ranking-score field on `TokenSearchResult`. No structural changes to existing types. |
| `src/store/useTokenStore.ts` | Confirm existing `searchResults` / `searchStatus` actions are sufficient; add minor actions only if needed. |

### Untouched
`token.service.ts::getTokenDetail`, `services/providers/dexscreener.ts`,
`services/providers/geckoterminal.ts`, `market.service.ts`, `arbitrage.service.ts`,
`types/arbitrage.ts`, `types/market.ts`, and all existing Visual Polish components
(`ChainLogo`, `DexLogo`, `TokenLogo`, `Select`, `Tooltip`, `Skeleton`, `EmptyState`).

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Dropdown live-query volume approaches DexScreener's rate limit under heavy usage | Debounce (≈300ms) at the hook level; results page uses a single request per explicit submit. |
| Liquidity/volume signals can be manipulated (wash trading, thin pools) | Ranking treats them as secondary to exact-match; pair-completeness penalty reduces weight of low-quality pools. Not a guarantee, only a mitigation. |
| DEX-prominence allowlist requires ongoing maintenance as new DEXs gain adoption | Keep the list small and explicitly documented as a ranking-only signal, not a trust signal. |
| Rare cross-chain address collisions could defeat the "full address = direct navigate" rule | Acceptable residual risk; affected users can still reach the results list via the "view other results" affordance. |
| Two-tier UX (dropdown + page) adds implementation surface area | Both surfaces share one service and one card component, minimizing duplicated logic. |

---

## 11. Future Compatibility

- **Quote Verification Layer:** integrates at Token Detail (and later Arbitrage Engine) without
  touching Search, per the boundary in Section 8.
- **Arbitrage Engine:** reuses `SearchResultCard` for token selection UI; ranking/service logic
  stays independent.
- **Verified-status badge:** explicit future extension point once a curated allowlist source
  exists; not part of this proposal's scope.

---

## 12. Acceptance Criteria

- Searching an exact, unambiguous symbol/name returns the correct token on the correct chain.
- Searching a name that legitimately exists on multiple chains (e.g. USDC) surfaces a result list,
  never a silent single guess.
- Every rendered result card displays chain and liquidity, sufficient to distinguish candidates
  without opening Token Detail.
- No price, FDV, or market cap value appears anywhere in the search/result-list UI.
- Zero-result queries render `EmptyState`, not an error.
- No changes required to `token.service.ts`, provider files, or Arbitrage/Market types.

---

## 13. Implementation Plan

Staged, each stage gated by a green build before proceeding — consistent with the project's
established workflow:

1. **Foundation** — `types/token.ts` additive fields, `search.service.ts` ranking logic,
   `useSearch.ts` hook, store wiring.
2. **Search Result Card** — `SearchResultCard.tsx`, built and reviewed against Section 6 in
   isolation (e.g. via a temporary test route or Storybook-style harness).
3. **Search Results Page** — `SearchResultsPage.tsx` + router entry.
4. **Search Dropdown** — `SearchDropdown.tsx`, wired to the same service.
5. **Dashboard Integration** — update `DashboardPage.tsx` search submit behavior per Section 7.

No pricing, quoting, or Arbitrage Engine logic is introduced at any stage.
