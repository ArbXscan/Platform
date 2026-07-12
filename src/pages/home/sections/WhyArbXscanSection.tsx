import { AnimatedSection } from "../../../components/shared/AnimatedSection"
import { Container } from "../../../components/ui/Container"
import { WHY_REASONS } from "../../../constants/landing"

export function WhyArbXscanSection() {
  return (
    <section id="why" className="py-20">
      <Container>
        <AnimatedSection className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Why ArbXscan
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Built from the ground up for serious multi-chain analytics.
          </p>
        </AnimatedSection>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_REASONS.map((reason, i) => (
            <AnimatedSection
              key={reason.id}
              animation={i % 2 === 0 ? "slide-right" : "slide-left"}
              delay={i * 0.05}
            >
              <div className="flex h-full gap-5 rounded-2xl border border-white/10 bg-white/5 p-7">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-2xl text-cyan-300">
                  <reason.icon />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {reason.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  )
}
