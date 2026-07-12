import { AnimatedSection } from "../../../components/shared/AnimatedSection"
import { Container } from "../../../components/ui/Container"
import { FEATURES } from "../../../constants/landing"

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <Container>
        <AnimatedSection className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Everything you need to trade smarter
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            A complete toolkit for Web3 analytics and arbitrage intelligence.
          </p>
        </AnimatedSection>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <AnimatedSection key={feature.id} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-400/10 text-2xl text-cyan-300 transition-colors group-hover:bg-cyan-400/20">
                  <feature.icon />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  )
}
