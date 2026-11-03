"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Info, CheckCircle2, ArrowRight } from "lucide-react"

import { AppShell } from "@/components/layout/AppShell"
import { LessonTopBar } from "@/components/layout/LessonTopBar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  headingMaskedReveal,
  fadeUpVariant,
  scalePopInVariant,
  calloutSlideVariant,
  iconJiggleVariant,
  checkpointElasticVariant,
  staggerContainerVariant,
} from "@/lib/motion-tokens"

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
          title="Basics 1: Greetings & Introductions"
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
        className="flex flex-col gap-12 pb-24"
      >
        {/* 1. Heading Masked Reveal */}
        <div className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit">Motion Token Gallery</Badge>
          <motion.h1
            variants={headingMaskedReveal}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Design System & Choreography
          </motion.h1>
          <motion.p
            variants={fadeUpVariant}
            className="text-lg text-muted-foreground"
          >
            Welcome to the Smart Canvas learning environment. Scroll down to see all 5 entrance animation tokens in action, running at a smooth 60fps.
          </motion.p>
        </div>

        <hr className="border-border" />

        {/* 2. Paragraph/Card Fade-Up */}
        <motion.div variants={fadeUpVariant}>
          <Card>
            <CardHeader>
              <CardTitle>Standard Card Fade-Up</CardTitle>
              <CardDescription>Using `fadeUpVariant` and `UI_SPRING`</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                This is a standard text block or card entering the viewport. It uses a gentle Y-axis translation and opacity fade, driven by our standard UI spring physics to ensure a natural, non-distracting entrance.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="default">Primary Action</Button>
              <Button variant="outline">Secondary</Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* 3. Motion Canvas Scale Pop-in */}
        <motion.div variants={scalePopInVariant} className="w-full aspect-video bg-muted rounded-xl border flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10" />
          <div className="flex flex-col items-center gap-4 z-10 text-center p-6">
            <div className="h-16 w-16 bg-primary rounded-2xl shadow-lg flex items-center justify-center text-primary-foreground">
              <ArrowRight className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">Motion Canvas Scale Pop-in</h3>
            <p className="text-sm text-muted-foreground">Used for interactive media or focal learning elements.</p>
          </div>
        </motion.div>

        {/* 4. Callout Left-to-Right + Icon Spring Jiggle */}
        <motion.div
          variants={calloutSlideVariant}
          className="flex gap-4 p-4 rounded-lg bg-warning/10 border border-warning/20 text-warning-foreground"
        >
          <motion.div variants={iconJiggleVariant} className="flex-shrink-0 mt-0.5">
            <Info className="h-6 w-6 text-warning" />
          </motion.div>
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-warning-foreground">Important Grammatical Note</h4>
            <p className="text-sm opacity-90">
              Notice how the container slides in from the left, and a fraction of a second later, the icon jiggles into place using the elastic checkpoint spring.
            </p>
          </div>
        </motion.div>

        {/* 5. Checkpoint Elastic Pop-in */}
        <div className="py-12 flex justify-center">
          <motion.div variants={checkpointElasticVariant} className="max-w-md w-full">
            <Card className="border-success/30 shadow-lg shadow-success/10">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-success">Checkpoint Reached!</CardTitle>
                <CardDescription>Using `checkpointElasticVariant`</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <p className="text-sm text-muted-foreground">
                  This elastic pop-in uses a higher stiffness and mass for a dramatic, rewarding reveal when a learner successfully completes a major section.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Button variant="success" className="w-full sm:w-auto font-semibold">
                  Continue Learning
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

      </motion.div>
    </AppShell>
  )
}
