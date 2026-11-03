import { Variants, Transition } from "framer-motion";

// ==========================================
// PHYSICS CONSTANTS
// ==========================================

export const UI_SPRING: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 14,
  mass: 1,
};

export const CHECKPOINT_ELASTIC_SPRING: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 18,
  mass: 1.2,
};

export const CHECKPOINT_MODAL_SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

export const HEADING_REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]; // Custom easing curve

export const STAGGER_CONTAINER = { staggerChildren: 0.08 };

// ==========================================
// ENTRANCE CHOREOGRAPHY TOKENS
// ==========================================

// 1. Heading Masked Reveal
// Used for main lesson titles or section headers
export const headingMaskedReveal: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  whileInView: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: 0.1,
      ease: HEADING_REVEAL_EASE,
    },
  },
};

// 2. Paragraph/Card Fade-Up
// Standard entrance for text blocks and basic cards
export const fadeUpVariant: Variants = {
  initial: {
    y: 16,
    opacity: 0,
  },
  whileInView: {
    y: 0,
    opacity: 1,
    transition: UI_SPRING,
  },
};

// 3. Motion Canvas Scale Pop-in
// Used for interactive elements or images popping into the canvas
export const scalePopInVariant: Variants = {
  initial: {
    scale: 0.95,
    opacity: 0,
  },
  whileInView: {
    scale: 1,
    opacity: 1,
    transition: UI_SPRING,
  },
};

// 4. Callout Left-to-Right + Icon Spring Jiggle
// Used for callout boxes (like hints, warnings, info)
export const calloutSlideVariant: Variants = {
  initial: {
    x: -20,
    opacity: 0,
  },
  whileInView: {
    x: 0,
    opacity: 1,
    transition: UI_SPRING,
  },
};

export const iconJiggleVariant: Variants = {
  initial: {
    scale: 0.5,
    opacity: 0,
  },
  whileInView: {
    scale: 1,
    opacity: 1,
    transition: {
      ...CHECKPOINT_ELASTIC_SPRING,
      delay: 0.1, // Slight delay after container
    },
  },
};

// 5. Checkpoint Elastic Pop-in
// Used for major interactive checkpoints or modal reveals
export const checkpointElasticVariant: Variants = {
  initial: {
    scale: 0.85,
    y: 20,
    opacity: 0,
  },
  whileInView: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: CHECKPOINT_ELASTIC_SPRING,
  },
};

// Utility to stagger children if wrapped in a motion container
export const staggerContainerVariant: Variants = {
  initial: {},
  whileInView: {
    transition: STAGGER_CONTAINER,
  },
};
