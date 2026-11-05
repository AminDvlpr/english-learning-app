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
interface BlockWrapperProps {
  block: LessonBlock;
  state: BlockLearnerState;
  children: React.ReactNode;
}

export function BlockWrapper({ block, children }: BlockWrapperProps) {
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
        className="w-full h-full flex flex-col justify-center"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
