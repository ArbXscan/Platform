import { AnimatedSection } from "../../../components/shared/AnimatedSection"
import { Container } from "../../../components/ui/Container"
import { Button } from "../../../components/ui/Button"
import { COMMUNITY_LINKS, APP_ROUTE } from "../../../constants/landing"

export function CommunitySection() {
  return (
    <section id="community" className="py-20">
      <Container>
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />

            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Join the ArbXscan community
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              Get alpha, share strategies and shape the roadmap with traders and
              builders across the multi-chain ecosystem.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {COMMUNITY_LINKS.map((c) => (
                <a
                  key={c.id}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl text-slate-300 transition-all hover:-translate-y-1 hover:border-cyan-400/40 hover:text-cyan-300"
                  aria-label={c.label}
                >
                  <c.icon />
                </a>
              ))}
            </div>

            <div className="mt-10">
              <Button href={APP_ROUTE} size="lg">
                Open App →
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  )
}
