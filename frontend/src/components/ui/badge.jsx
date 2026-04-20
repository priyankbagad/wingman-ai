import { cn } from "../../lib/utils"

const variants = {
  default: "bg-[#1e1e2e] text-slate-400 border-[#2a2a3e]",
  red:     "bg-red-950/60 text-red-400 border-red-900/60",
  amber:   "bg-amber-950/60 text-amber-400 border-amber-900/60",
  green:   "bg-green-950/60 text-green-400 border-green-900/60",
  yellow:  "bg-yellow-950/60 text-yellow-400 border-yellow-900/60",
  indigo:  "bg-indigo-950/60 text-indigo-400 border-indigo-900/60",
}

export function Badge({ children, variant = "default", className }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border leading-none",
      variants[variant] ?? variants.default,
      className
    )}>
      {children}
    </span>
  )
}
