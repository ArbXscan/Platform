import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

const HomePage = lazy(() => import("./pages/home/HomePage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const SearchResultsPage = lazy(() => import("./pages/search/SearchResultsPage"));
const TokenDetailPage = lazy(() => import("./pages/token/TokenDetailPage"));
const ArbitragePage = lazy(() => import("./pages/arbitrage/ArbitragePage"));
const MarketPage = lazy(() => import("./pages/market/MarketPage"));
const ScannerPage = lazy(() => import("./pages/scanner/ScannerPage"));
const CrossChainArbitragePage = lazy(() => import("./pages/cross-chain/CrossChainArbitragePage"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
      Loading...
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="token/:query" element={<TokenDetailPage />} />
          <Route path="arbitrage" element={<ArbitragePage />} />
          <Route path="market" element={<MarketPage />} />
          <Route path="scanner" element={<ScannerPage />} />
          <Route path="cross-chain" element={<CrossChainArbitragePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
