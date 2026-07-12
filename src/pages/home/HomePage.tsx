import { Navbar } from "../../components/layout/Navbar"
import { Footer } from "../../components/layout/Footer"
import { HeroSection } from "./sections/HeroSection"
import { ProductIntroSection } from "./sections/ProductIntroSection"
import { FeaturesSection } from "./sections/FeaturesSection"
import { HowItWorksSection } from "./sections/HowItWorksSection"
import { SupportedChainsSection } from "./sections/SupportedChainsSection"
import { WhyArbXscanSection } from "./sections/WhyArbXscanSection"
import { FaqSection } from "./sections/FaqSection"
import { CommunitySection } from "./sections/CommunitySection"

/**
 * ArbXscan public Landing Page (route: "/").
 * Pure UI composition — no business logic. Content comes from constants/landing.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen text-white antialiased selection:bg-cyan-400/30">
      <Navbar />
      <main>
        <HeroSection />
        <ProductIntroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SupportedChainsSection />
        <WhyArbXscanSection />
        <FaqSection />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  )
}
