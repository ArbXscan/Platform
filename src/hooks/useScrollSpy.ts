import { useEffect, useState } from "react"

/** Tracks which section id is currently in view to highlight active nav links. */
export function useScrollSpy(sectionIds: string[], offset = 120): string {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + offset
      let current = ""
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollY) current = id
      }
      setActiveId(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [sectionIds, offset])

  return activeId
}
