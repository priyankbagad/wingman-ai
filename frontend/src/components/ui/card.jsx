import { cn } from "../../lib/utils"

export function Card({ children, className }) {
  return (
    <div className={cn("rounded-lg border border-[#1e1e2e] bg-[#111118]", className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("flex items-center gap-2 px-5 py-3.5 border-b border-[#1e1e2e]", className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={cn("px-5 py-4", className)}>
      {children}
    </div>
  )
}
