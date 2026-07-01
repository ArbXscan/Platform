import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const HomePage = lazy(() => import("./pages/home/HomePage"))

// Placeholder saja, belum dashboard asli
function DashboardPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      Dashboard Coming Soon
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app" element={<DashboardPlaceholder />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
