import { validateLesson } from '../lesson-validator';
import { LessonBlock } from '@/types';

// A simple assertion helper for pure TS testing
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runLessonValidatorTests() {
  console.log('Running pure TS tests for lesson-validator...');

  // Test 1: Valid blocks
  const validBlocks: LessonBlock[] = [
    { type: 'heading_intro', blockId: 'h1', order: 1, title: 'Hello', subtitle: 'Sub', topicTag: 'tag', iconIdentifier: 'icon', estimatedDuration: 5, xpReward: 10 },
    { type: 'motion_canvas', blockId: 'm1', order: 2, motionSceneId: 'scene1', assetPath: '/scene.riv', maxContinuousDurationSec: 30, xpReward: 20 }
  ];
  const validResult = validateLesson(validBlocks);
  assert(validResult.valid, 'Valid blocks should pass validation');
  assert(validResult.errors.length === 0, 'No errors should be returned for valid blocks');
  console.log('✓ Valid blocks test passed');

  // Test 2: Duplicate block IDs
  const duplicateBlocks: LessonBlock[] = [
    { type: 'heading_intro', blockId: 'h1', order: 1, title: 'Hello', subtitle: 'Sub', topicTag: 'tag', iconIdentifier: 'icon', estimatedDuration: 5, xpReward: 10 },
    { type: 'callout', blockId: 'h1', order: 2, variant: 'golden_tip', title: 'Callout', content: 'Info', xpReward: 5 }
  ];
  const duplicateResult = validateLesson(duplicateBlocks);
  assert(!duplicateResult.valid, 'Duplicate blocks should fail validation');
  assert(duplicateResult.errors.some(e => e.includes('Duplicate blockId found')), 'Error message should mention duplicate ID');
  console.log('✓ Duplicate block IDs test passed');

  // Test 3: motion_canvas > 60s duration
  const longMotionBlocks: LessonBlock[] = [
    { type: 'motion_canvas', blockId: 'm1', order: 1, motionSceneId: 'scene1', assetPath: '/scene.riv', maxContinuousDurationSec: 65, xpReward: 20 }
  ];
  const longMotionResult = validateLesson(longMotionBlocks);
  assert(!longMotionResult.valid, 'Motion canvas blocks > 60s should fail validation');
  assert(longMotionResult.errors.some(e => e.includes('exceeds maximum continuous duration of 60 seconds')), 'Error message should mention duration limit');
  console.log('✓ Maximum motion canvas duration test passed');

  console.log('All lesson-validator tests passed successfully! 🎉\n');
}

// Self-executing block if run directly via ts-node / tsx
if (typeof require !== 'undefined' && require.main === module) {
  runLessonValidatorTests();
}
