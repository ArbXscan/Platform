import { AnimatedSection } from "../../../components/shared/AnimatedSection"
import { Container } from "../../../components/ui/Container"

export function ProductIntroSection() {
  return (
    <section id="intro" className="py-20">
      <Container>
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            The Platform
          </p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            One intelligence layer for the entire multi-chain market
          </h2>
          <p className="mt-6 text-lg text-slate-300">
            Markets move across dozens of venues and chains at once. ArbXscan
            unifies that fragmented data into a single, real-time view — combining
            token analytics, market overview and an arbitrage scanner into one
            professional-grade platform.
          </p>
        </AnimatedSection>
      </Container>
    </section>
  )
}
