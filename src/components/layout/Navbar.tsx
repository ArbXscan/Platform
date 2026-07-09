import { useState } from "react"
import { Link } from "react-router-dom"
import { FiMenu, FiX } from "react-icons/fi"
import { Button } from "../ui/Button"
import { Container } from "../ui/Container"
import { useScrolled } from "../../hooks/useScrolled"
import { useScrollSpy } from "../../hooks/useScrollSpy"
import { scrollToHash } from "../../utils/scroll"
import { NAV_LINKS, APP_ROUTE } from "../../constants/landing"

const SECTION_IDS = NAV_LINKS.filter((l) => l.href.startsWith("#")).map((l) =>
  l.href.replace("#", ""),
)

export function Navbar() {
  const scrolled = useScrolled(12)
  const activeId = useScrollSpy(SECTION_IDS)
  const [open, setOpen] = useState(false)

  const handleNavClick = (href: string) => {
    setOpen(false)
    if (href.startsWith("#")) scrollToHash(href)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-slate-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-white">
        <img
  src="/favicon.png"
  alt="ArbXscan"
  className="h-8 w-8 rounded-lg"
/>
          <span className="text-lg tracking-tight">
            ArbX<span className="text-cyan-400">scan</span>
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className={`text-sm transition-colors ${
                  activeId === link.href.replace("#", "")
                    ? "text-cyan-300"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden md:block">
          <Button href={APP_ROUTE} size="sm">
            Open App
          </Button>
        </div>

        {/* mobile toggle */}
        <button
          className="text-2xl text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </Container>

      {/* mobile drawer */}
      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 backdrop-blur-xl md:hidden">
          <Container className="flex flex-col gap-4 py-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith("#")) e.preventDefault()
                  handleNavClick(link.href)
                }}
                className="text-base text-slate-200 hover:text-cyan-300"
              >
                {link.label}
              </a>
            ))}
            <Button href={APP_ROUTE} className="mt-2 w-full">
              Open App
            </Button>
          </Container>
        </div>
      )}
    </header>
  )
}
