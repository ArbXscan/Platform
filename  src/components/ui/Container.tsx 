import type { PropsWithChildren } from "react"

interface ContainerProps {
  className?: string
}

export function Container({ children, className = "" }: PropsWithChildren<ContainerProps>) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  )
}
