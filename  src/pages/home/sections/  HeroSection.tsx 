import { motion } from "framer-motion"
import { Button } from "../../../components/ui/Button"
import { Badge } from "../../../components/ui/Badge"
import { Container } from "../../../components/ui/Container"
import { AnimatedCounter } from "../../../components/shared/AnimatedCounter"
import { DashboardPreview } from "../../../components/charts/DashboardPreview"
import { HERO_STATS, APP_ROUTE } from "../../../constants/landing"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />

      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge>Web3 Analytics &amp; Arbitrage Intelligence</Badge>
          </motion.div>

          <motion.h1
            className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <>
              See every arbitrage
              <br />
            </>
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              opportunity in real time
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg text-slate-300"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ArbXscan aggregates 40+ DEXs across 8+ chains, scans price spreads
            instantly, and scores each opportunity by confidence — so you act on
            signal, not noise.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button href={APP_ROUTE} size="lg">
              Open App →
            </Button>

            <Button href="#how-it-works" variant="secondary" size="lg">
              See how it works
            </Button>
          </motion.div>

          {/* stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {HERO_STATS.map((stat) => (
              <div key={stat.id}>
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    decimals={stat.value % 1 !== 0 ? 1 : 0}
                  />
                </p>
                <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          <DashboardPreview />
        </motion.div>
      </Container>
    </section>
  )
}
