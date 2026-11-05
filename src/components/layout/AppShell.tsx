"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  topBar?: React.ReactNode
}

export function AppShell({ children, topBar, className, ...props }: AppShellProps) {
  const pathname = usePathname()
  const isBuilder = pathname?.startsWith('/builder')

  const containerClass = isBuilder
    ? "w-full max-w-none h-[100dvh] bg-background flex flex-col overflow-hidden relative"
    : "w-full max-w-[430px] h-[100dvh] sm:h-[94dvh] sm:max-h-[880px] sm:rounded-[36px] sm:border-[6px] sm:border-neutral-800 bg-background flex flex-col overflow-hidden relative shadow-2xl mx-auto"

  return (
    <div className="bg-neutral-950 min-h-[100dvh] flex justify-center items-center">
      <div className={cn(containerClass, className, "font-sans")} {...props}>
        {topBar && (
          <div className="flex-none">
            {topBar}
          </div>
        )}
        <main className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
