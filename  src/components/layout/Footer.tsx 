import { Link } from "react-router-dom"
import { Container } from "../ui/Container"
import { scrollToHash } from "../../utils/scroll"
import {
  NAV_LINKS,
  COMMUNITY_LINKS,
  APP_ROUTE,
  DOCS_ROUTE,
} from "../../constants/landing"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950">
                A
              </span>
              <span className="text-lg">
                ArbX<span className="text-cyan-400">scan</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              The Web3 Analytics &amp; Arbitrage Intelligence Platform. Aggregate,
              scan, score and act — all in one place.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {NAV_LINKS.filter((l) => l.href.startsWith("#")).map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToHash(l.href)
                    }}
                    className="hover:text-cyan-300"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to={DOCS_ROUTE} className="hover:text-cyan-300">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to={APP_ROUTE} className="hover:text-cyan-300">
                  Open App
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Community</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {COMMUNITY_LINKS.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-cyan-300"
                  >
                    <c.icon /> {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>© {year} ArbXscan. All rights reserved.</p>
          <p>Built for the multi-chain era.</p>
        </div>
      </Container>
    </footer>
  )
}
