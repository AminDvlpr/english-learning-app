"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    // Ensure value is between 0 and 100
    const safeValue = Math.min(Math.max(value, 0), 100)

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <motion.div
          className={cn(
            "h-full w-full flex-1 bg-primary origin-left",
            indicatorClassName
          )}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: safeValue / 100 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
