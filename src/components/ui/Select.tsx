import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { FiCheck, FiChevronDown } from "react-icons/fi"

export interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  label?: string
  className?: string
}

/**
 * Custom listbox dropdown (button + popover list), replacing native <select>.
 * Built with plain React state + Tailwind — no new dependency (no Radix/shadcn).
 * Keyboard support: Enter/Space to open, ArrowUp/ArrowDown to move, Enter to
 * pick, Escape to close. Closes on outside click.
 */
export function Select<T extends string>({ value, onChange, options, label, className = "" }: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => options.findIndex((o) => o.value === value))
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOutsideClick)
    return () => document.removeEventListener("mousedown", onOutsideClick)
  }, [])

  function commit(index: number) {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setOpen(false)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault()
        setOpen(true)
        setActiveIndex(options.findIndex((o) => o.value === value))
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      commit(activeIndex)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && <span className="sr-only">{label}</span>}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white transition-colors hover:border-white/20 focus:border-cyan-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
      >
        <span className="truncate">{selected?.label ?? "Select…"}</span>
        <FiChevronDown className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-64 w-full min-w-[10rem] overflow-auto rounded-lg border border-white/10 bg-slate-900/95 p-1 shadow-xl shadow-black/40 backdrop-blur-xl"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(index)}
              className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                index === activeIndex ? "bg-cyan-400/10 text-cyan-300" : "text-slate-300"
              }`}
            >
              {option.label}
              {option.value === value && <FiCheck className="text-cyan-400" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
