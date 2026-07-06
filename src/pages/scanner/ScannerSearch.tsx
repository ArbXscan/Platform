import { useState } from "react"
import type { FormEvent } from "react"
import { FiSearch } from "react-icons/fi"
import { Button } from "../../components/ui/Button"

interface ScannerSearchProps {
  /** Called with the trimmed, non-empty query on submit. */
  onSearch: (term: string) => void
  disabled?: boolean
}

/**
 * Free-text query input for the Scanner Page — token name, symbol, or
 * contract address. Presentation only: captures the raw text and hands it
 * to the caller on submit. No validation, parsing, chain detection, or
 * ranking happens here — all of that lives inside runScannerIntegration via
 * the existing Token Scanner / Search Ranking engines. Local component
 * state only.
 */
export function ScannerSearch({ onSearch, disabled }: ScannerSearchProps) {
  const [value, setValue] = useState("")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Token name, symbol, or contract address"
          disabled={disabled}
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none disabled:opacity-60"
        />
      </div>
      <Button type="submit" size="md" disabled={disabled} className="sm:w-auto">
        Scan
      </Button>
    </form>
  )
}
