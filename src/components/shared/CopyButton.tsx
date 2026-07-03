import { useState } from "react"
import { FiCheck, FiCopy } from "react-icons/fi"

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

export function CopyButton({ value, label = "Copy", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API can fail (permissions, insecure context) — fail silently,
      // the address text is still visible/selectable next to the button.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : label}
      className={`inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${className}`}
    >
      {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
      {copied ? "Copied" : label}
    </button>
  )
}
