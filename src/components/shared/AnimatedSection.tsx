import type { ElementType, PropsWithChildren } from "react"
import { motion } from "framer-motion"

type Animation = "fade" | "slide-up" | "slide-left" | "slide-right"

interface AnimatedSectionProps {
  as?: ElementType
  animation?: Animation
  delay?: number
  className?: string
  id?: string
}

const variants = {
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: 32 },
    show: { opacity: 1, x: 0 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: -32 },
    show: { opacity: 1, x: 0 },
  },
}

/**
 * Reusable scroll reveal wrapper.
 * Animates once when the component enters the viewport.
 */
export function AnimatedSection({
  children,
  animation = "slide-up",
  delay = 0,
  className = "",
  id,
}: PropsWithChildren<AnimatedSectionProps>) {
  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      variants={variants[animation]}
    >
      {children}
    </motion.div>
  )
}
