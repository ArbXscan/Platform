import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FiChevronDown } from "react-icons/fi"
import { AnimatedSection } from "../../../components/shared/AnimatedSection"
import { Container } from "../../../components/ui/Container"
import { FAQS } from "../../../constants/landing"

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null)

  return (
    <section id="faq" className="py-20">
      <Container className="max-w-3xl">
        <AnimatedSection className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </AnimatedSection>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openId === faq.id

            return (
              <AnimatedSection key={faq.id} delay={i * 0.05}>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <button
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-white">
                      {faq.question}
                    </span>

                    <FiChevronDown
                      className={`shrink-0 text-cyan-300 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
