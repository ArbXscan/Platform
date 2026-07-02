import { useState } from "react"
import { motion } from "framer-motion"
import { useCounter } from "../../hooks/useCounter"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const [enabled, setEnabled] = useState(false)
  const count = useCounter({ target: value, enabled, decimals })

  return (
    <motion.span
      className={className}
      onViewportEnter={() => setEnabled(true)}
      viewport={{ once: true }}
    >
      {prefix}
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </motion.span>
  )
}
