import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { FiGrid, FiZap, FiBarChart2, FiSearch, FiRepeat, FiArrowLeft, FiMenu, FiX } from "react-icons/fi"

interface NavItem {
  label: string
  to: string
  icon: typeof FiGrid
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/app", icon: FiGrid },
  { label: "Scanner", to: "/app/scanner", icon: FiSearch },
  { label: "Arbitrage Scanner", to: "/app/arbitrage", icon: FiZap },
  { label: "Cross-Chain Arbitrage", to: "/app/cross-chain", icon: FiRepeat },
  { label: "Market", to: "/app/market", icon: FiBarChart2 },
]

function isActive(pathname: string, to: string) {
  // exact match for the dashboard index route, prefix match for everything else
  return to === "/app" ? pathname === "/app" : pathname.startsWith(to)
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        className="flex h-16 items-center gap-2 border-b border-white/10 px-5 font-bold text-white"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
          A
        </span>
        <span className="text-lg tracking-tight">
          ArbX<span className="text-cyan-400">scan</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
          const active = isActive(pathname, to)
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="text-base" />
              {label}
            </Link>
          )
        })}
      </nav>

      <Link
        to="/"
        className="flex items-center gap-2 border-t border-white/10 px-5 py-4 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <FiArrowLeft />
        Back to site
      </Link>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-slate-950 md:block">
        <SidebarContent />
      </aside>

      {/* mobile top bar + drawer */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 backdrop-blur-xl md:hidden">
        <Link to="/" className="flex items-center gap-2 font-bold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 text-sm">
            A
          </span>
          <span className="text-base tracking-tight">
            ArbX<span className="text-cyan-400">scan</span>
          </span>
        </Link>
        <button
          className="text-2xl text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-14 z-30 bg-slate-950 md:hidden">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}
