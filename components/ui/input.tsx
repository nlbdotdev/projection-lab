import * as React from "react"

import { cn } from "@/lib/utils"

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 gumroad:rounded-2xl gumroad:text-lg gumroad:font-semibold gumroad:px-5 gumroad:py-3 gumroad:border-[--border] linear:rounded-none linear:text-base linear:font-medium linear:px-4 linear:py-2 linear:border-[--border]"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return <input type={type} className={cn(inputClass, className)} ref={ref} {...props} />
  }
)
