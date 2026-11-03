"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { AppShell } from "@/components/layout/AppShell"
import { LessonTopBar } from "@/components/layout/LessonTopBar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MotionBlockWrapper } from "@/components/motion/MotionBlockWrapper"
import { sampleCafeLesson } from "@/data/sample-cafe-lesson"
import { staggerContainerVariant } from "@/lib/motion-tokens"

export default function Home() {
  const [progress, setProgress] = React.useState(25)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppShell
      topBar={
        <LessonTopBar
          title="Polite Ordering in an English Café"
          progress={progress}
          streak={12}
          hearts={4}
        />
      }
    >
      <motion.div
        variants={staggerContainerVariant}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col gap-8 pb-24 max-w-2xl mx-auto w-full"
      >
        <Badge variant="outline" className="w-fit self-center mb-4">Smart Canvas Preview</Badge>

        {sampleCafeLesson.map((block, index) => {
          // For demo purposes, we assign mock states based on index
          const state = index === 0 ? "completed" : index === 1 ? "active" : index === 3 ? "verification-required" : index === 5 ? "adaptive-remediation" : "locked";

          return (
            <MotionBlockWrapper key={block.blockId} block={block} state={state}>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span className="capitalize">{block.type.replace('_', ' ')}</span>
                    <Badge>{block.difficultyLevel || 'N/A'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap text-left dir-ltr p-2 bg-muted rounded-md border border-border">
                    {JSON.stringify(block, null, 2)}
                  </pre>
                  {/* Additional rendering logic for specific blocks to show bilingual compatibility */}
                  {block.type === 'callout' && block.bilingualExample && (
                    <div className="mt-4 p-4 border rounded-md bg-background">
                      <p className="font-semibold mb-2">Bilingual Example:</p>
                      <p dir="ltr" className="text-left font-mono bg-muted p-2 rounded">{block.bilingualExample.en}</p>
                      <p dir="rtl" className="text-right font-vazirmatn mt-2">{block.bilingualExample.fa}</p>
                    </div>
                  )}
                  {block.type === 'interactive_checkpoint' && block.question && (
                    <div className="mt-4 p-4 border rounded-md bg-background">
                      <p className="font-semibold mb-2" dir="rtl">{block.question.prompt}</p>
                      {block.question.options && block.question.options.map(opt => (
                        <p key={opt.id} dir="ltr" className="text-left font-mono mt-1 text-sm bg-muted p-2 rounded">
                          - {opt.text}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </MotionBlockWrapper>
          )
        })}

      </motion.div>
    </AppShell>
  )
}
