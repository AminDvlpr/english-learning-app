"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/AppShell"
import { LessonTopBar } from "@/components/layout/LessonTopBar"
import { LessonBuilderStudio } from "@/components/builder/LessonBuilderStudio"

export default function BuilderPage() {
  return (
    <AppShell
      topBar={
        <LessonTopBar
          title="Lesson Builder Studio"
          progress={0}
        />
      }
      className="!max-w-full"
    >
      <div className="flex-1 flex flex-col h-full w-full max-w-[1600px] mx-auto overflow-hidden">
        <LessonBuilderStudio />
      </div>
    </AppShell>
  )
}
