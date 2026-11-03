import * as React from "react"
import { cn } from "@/lib/utils"

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  topBar?: React.ReactNode
}

export function AppShell({ children, topBar, className, ...props }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background flex flex-col font-sans", className)} {...props}>
      {topBar && (
        <div className="flex-none">
          {topBar}
        </div>
      )}
      <main className="flex-1 flex flex-col items-center w-full px-4 py-8 md:py-12">
        <div className="w-full max-w-3xl lg:max-w-4xl flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  )
}
