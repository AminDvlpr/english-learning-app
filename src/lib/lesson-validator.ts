import { LessonBlock, MotionCanvasBlock } from "@/types";

export function validateLesson(blocks: LessonBlock[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check unique block IDs
  const blockIds = new Set<string>();
  for (const block of blocks) {
    if (blockIds.has(block.blockId)) {
      errors.push(`Duplicate blockId found: ${block.blockId}`);
    }
    blockIds.add(block.blockId);

    // Rule: no motion_canvas block can have maxContinuousDurationSec > 60
    if (block.type === 'motion_canvas') {
      const motionBlock = block as MotionCanvasBlock;
      if (motionBlock.maxContinuousDurationSec > 60) {
        errors.push(`motion_canvas block ${block.blockId} exceeds maximum continuous duration of 60 seconds (found: ${motionBlock.maxContinuousDurationSec}s).`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
