import { AnimatedSection } from "../../../components/shared/AnimatedSection"
import { Container } from "../../../components/ui/Container"
import { HOW_IT_WORKS } from "../../../constants/landing"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <Container>
        <AnimatedSection className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            How ArbXscan works
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            From fragmented market data to ranked opportunities in four steps.
          </p>
        </AnimatedSection>

        <div className="relative mt-14 grid gap-6 md:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <AnimatedSection key={step.id} delay={i * 0.1}>
              <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-7">
                <span className="text-5xl font-extrabold text-cyan-400/20">
                  {String(step.step).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  )
}
