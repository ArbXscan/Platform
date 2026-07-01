import { useEffect, useRef, useState } from "react"

interface UseCounterOptions {
  target: number
  duration?: number
  /** Only start counting when true (e.g. when scrolled into view) */
  enabled?: boolean
  decimals?: number
}

/** requestAnimationFrame-based counter. Lightweight, no external deps. */
export function useCounter({
  target,
  duration = 1600,
  enabled = true,
  decimals = 0,
}: UseCounterOptions): number {
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!enabled || startedRef.current) return
    startedRef.current = true

    let frame = 0
    const start = performance.now()
    const factor = 10 ** decimals

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutCubic for a natural settle
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased * factor) / factor)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled, target, duration, decimals])

  return value
}
