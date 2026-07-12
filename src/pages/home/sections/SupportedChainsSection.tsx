import { AnimatedSection } from "../../../components/shared/AnimatedSection"
import { Container } from "../../../components/ui/Container"
import { LogoCarousel } from "../../../components/shared/LogoCarousel"
import { SUPPORTED_CHAINS } from "../../../constants/landing"

export function SupportedChainsSection() {
  return (
    <section id="chains" className="py-20">
      <Container>
        <AnimatedSection className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Supported chains
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Coverage across the chains that matter — with more added continuously.
          </p>
        </AnimatedSection>

        <div className="mt-12">
          <LogoCarousel items={SUPPORTED_CHAINS} />
        </div>
      </Container>
    </section>
  )
}
