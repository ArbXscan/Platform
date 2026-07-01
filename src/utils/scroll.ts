/** Smoothly scrolls to a section by hash, accounting for the sticky navbar height. */
export function scrollToHash(hash: string, navbarOffset = 80): void {
  const id = hash.replace("#", "")
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - navbarOffset
  window.scrollTo({ top, behavior: "smooth" })
}
