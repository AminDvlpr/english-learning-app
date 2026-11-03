"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LessonBlock, BlockLearnerState } from "@/types";
import {
  headingMaskedReveal,
  fadeUpVariant,
  scalePopInVariant,
  calloutSlideVariant,
  checkpointElasticVariant,
} from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

interface MotionBlockWrapperProps {
  block: LessonBlock;
  state: BlockLearnerState;
  children: React.ReactNode;
}

export function MotionBlockWrapper({ block, state, children }: MotionBlockWrapperProps) {
  const getVariants = () => {
    switch (block.type) {
      case "heading_intro":
        return headingMaskedReveal;
      case "callout":
        return calloutSlideVariant;
      case "motion_canvas":
        return scalePopInVariant;
      case "interactive_checkpoint":
        return checkpointElasticVariant;
      case "toggle_table":
        return fadeUpVariant; // fallback to generic card fade-up
      default:
        return fadeUpVariant;
    }
  };

  const variants = getVariants();

  return (
    <AnimatePresence>
      <motion.div
        key={block.blockId}
        variants={variants}
        initial="initial"
        whileInView="whileInView"
        exit="initial"
        viewport={{ once: true, margin: "-50px" }}
        className={cn(
          "relative w-full rounded-xl transition-all duration-500",
          {
            "opacity-50 blur-[2px] pointer-events-none select-none": state === "locked",
            "ring-2 ring-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]": state === "verification-required",
            "ring-2 ring-success/50 bg-success/5": state === "completed",
            "ring-2 ring-destructive/50 bg-destructive/5": state === "adaptive-remediation",
          }
        )}
      >
        {state === "locked" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-border">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        )}

        {state === "completed" && (
          <div className="absolute -top-3 -right-3 z-50">
            <div className="bg-success rounded-full p-1 shadow-lg border-2 border-background">
              <CheckCircle2 className="w-5 h-5 text-success-foreground" />
            </div>
          </div>
        )}

        {state === "adaptive-remediation" && (
          <div className="absolute -top-3 -right-3 z-50">
            <div className="bg-destructive rounded-full p-1 shadow-lg border-2 border-background">
              <AlertCircle className="w-5 h-5 text-destructive-foreground" />
            </div>
          </div>
        )}

        <div className={cn("w-full relative z-0", {
           // We might need an inner container for states if they affect children layouts, but sticking to standard wrapper structure for now.
        })}>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
