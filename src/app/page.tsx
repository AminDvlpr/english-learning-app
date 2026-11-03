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
import { useLearnerStore } from "@/store/useLearnerStore"
import { LearnerStateInspector } from "@/components/canvas/LearnerStateInspector"
import { HeadingIntroBlock, CalloutBlock, ToggleTableBlock } from "@/components/canvas/blocks"
import {
  HeadingIntroBlock as HeadingIntroBlockType,
  CalloutBlock as CalloutBlockType,
  ToggleTableBlock as ToggleTableBlockType
} from "@/types"

export default function Home() {
  const blockStates = useLearnerStore(state => state.blockStates)
  const xp = useLearnerStore(state => state.xp)

  React.useEffect(() => {
    useLearnerStore.persist.onFinishHydration(() => {
      if (useLearnerStore.getState().currentLessonId !== 'lesson_cafe_001') {
        useLearnerStore.getState().initializeLesson('lesson_cafe_001', sampleCafeLesson)
      }
    })
  }, [])

  return (
    <AppShell
      topBar={
        <LessonTopBar
          title="Polite Ordering in an English Café"
          progress={Math.min(100, xp)} // Simple progress mapping
          streak={12}
          hearts={4}
        />
      }
    >
      <div className="flex gap-8 relative max-w-5xl mx-auto w-full px-4">
        {/* Left Side: Lesson Canvas */}
        <motion.div
          variants={staggerContainerVariant}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-8 pb-24 flex-1"
        >
          <Badge variant="outline" className="w-fit self-center mb-4">Smart Canvas Interactive</Badge>

          {sampleCafeLesson.map((block) => {
            const bState = blockStates[block.blockId]?.state || 'locked';

            return (
              <MotionBlockWrapper key={block.blockId} block={block} state={bState}>
                {block.type === 'heading_intro' && (
                  <HeadingIntroBlock block={block as HeadingIntroBlockType} state={bState} />
                )}

                {block.type === 'callout' && (
                  <CalloutBlock block={block as CalloutBlockType} state={bState} />
                )}

                {block.type === 'toggle_table' && (
                  <ToggleTableBlock block={block as ToggleTableBlockType} state={bState} />
                )}

                {/* Keep raw JSON previews for remaining block types (Motion Canvas, Interactive Checkpoints) for future phases */}
                {(block.type !== 'heading_intro' && block.type !== 'callout' && block.type !== 'toggle_table') && (
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
                )}
              </MotionBlockWrapper>
            )
          })}
        </motion.div>

        {/* Right Side: Diagnostic Inspector */}
        <div className="hidden lg:block w-80 shrink-0">
          <LearnerStateInspector />
        </div>
      </div>
    </AppShell>
  )
}
