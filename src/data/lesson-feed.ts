import { LessonBlock } from '@/types';
import { sampleCafeLesson } from './sample-cafe-lesson';

export interface FeedLesson {
  id: string;
  title: string;
  coverArtwork: string;
  tags: string[];
  blocks: LessonBlock[];
}

const lesson2Blocks: LessonBlock[] = [
  {
    type: 'heading_intro',
    blockId: 'blk_intro_l2',
    order: 1,
    title: 'Handling a Wrong Order Politely',
    subtitle: 'Learn how to politely correct a mistake in your order.',
    topicTag: 'Problem Solving',
    iconIdentifier: 'alert-circle',
    estimatedDuration: 5,
    difficultyLevel: 'beginner',
  },
  {
    type: 'motion_canvas',
    blockId: 'blk_video_l2',
    order: 2,
    motionSceneId: 'scene_wrong_order',
    assetPath: '/assets/rive/wrong-order-scene.riv',
    maxContinuousDurationSec: 30,
    caption: 'Watch how to correct a wrong order.',
    scrollSyncMarkers: [
      { timestamp: 5.0, markerName: 'noticing' },
      { timestamp: 15.0, markerName: 'correcting' },
    ],
    triggerTimestamp: 20.0,
  },
  {
    type: 'interactive_checkpoint',
    blockId: 'blk_chk_l2',
    order: 3,
    checkpointMode: 'branching_decision',
    motionSceneId: 'scene_wrong_order',
    triggerTimestamp: 20.0,
    difficultyLevel: 'intermediate',
    xpReward: 15,
    question: {
      prompt: 'چگونه محترمانه اشتباه در سفارش را گوشزد می‌کنید؟',
      targetPhraseEn: 'Excuse me, I think there is a mistake with my order.',
      timeLimitSec: 30,
      options: [
        { id: 'opt_1', text: 'You gave me the wrong order.', correct: false, feedback: 'Too aggressive.' },
        { id: 'opt_2', text: 'Excuse me, I think there is a mistake with my order.', correct: true, feedback: 'Very polite!' },
        { id: 'opt_3', text: 'This is not what I wanted.', correct: false, feedback: 'A bit rude.' },
      ],
    },
    adaptiveRules: {
      onFirstTrySuccess: {
        xp: 20,
        gems: 5,
        masteryDelta: 'high',
        nextDifficulty: 'harder',
      },
      onFailure: {
        triggerRemediationAnimation: true,
        provideSmartHint: true,
        adjustDifficulty: 'easier',
        smartHintText: 'Start with "Excuse me" and be polite.',
      },
    },
  },
];

const lesson3Blocks: LessonBlock[] = [
  {
    type: 'heading_intro',
    blockId: 'blk_intro_l3',
    order: 1,
    title: 'Small Talk & Paying the Bill',
    subtitle: 'Chatting with the barista and asking for the check.',
    topicTag: 'Casual Conversation',
    iconIdentifier: 'credit-card',
    estimatedDuration: 5,
    difficultyLevel: 'intermediate',
  },
  {
    type: 'motion_canvas',
    blockId: 'blk_video_l3',
    order: 2,
    motionSceneId: 'scene_paying_bill',
    assetPath: '/assets/rive/paying-scene.riv',
    maxContinuousDurationSec: 20,
    caption: 'How to ask for the bill.',
    triggerTimestamp: 15.0,
  },
  {
    type: 'interactive_checkpoint',
    blockId: 'blk_chk_l3',
    order: 3,
    checkpointMode: 'slot_matching',
    motionSceneId: 'scene_paying_bill',
    triggerTimestamp: 15.0,
    difficultyLevel: 'intermediate',
    question: {
      prompt: 'عبارت درخواست صورتحساب را کامل کنید.',
      options: [],
      slots: [
        { id: 'slot_1', expected: 'Can' },
        { id: 'slot_2', expected: 'bill' },
      ],
    },
    adaptiveRules: {
      onFirstTrySuccess: {
        xp: 15,
        gems: 3,
        masteryDelta: 10,
        nextDifficulty: 'same',
      },
      onFailure: {
        triggerRemediationAnimation: false,
        provideSmartHint: true,
        adjustDifficulty: 'same',
        smartHintText: '"Can I have the bill, please?"',
      },
    },
  },
  {
    type: 'interactive_checkpoint',
    blockId: 'blk_chk_l3_2',
    order: 4,
    checkpointMode: 'micro_sprint_reflex',
    motionSceneId: 'scene_paying_bill',
    triggerTimestamp: 20.0,
    difficultyLevel: 'advanced',
    question: {
      prompt: 'Quickly! Which means "keep the change"?',
      timeLimitSec: 5,
      options: [
        { id: 'opt_1', text: 'Keep the money.', correct: false, feedback: 'Not standard.' },
        { id: 'opt_2', text: 'Keep the change.', correct: true, feedback: 'Correct!' },
      ],
    },
    adaptiveRules: {
      onFirstTrySuccess: {
        xp: 30,
        gems: 10,
        masteryDelta: 'max',
        nextDifficulty: 'harder',
      },
      onFailure: {
        triggerRemediationAnimation: true,
        provideSmartHint: false,
        adjustDifficulty: 'easier',
      },
    },
  },
];


export const lessonFeed: FeedLesson[] = [
  {
    id: 'lesson_cafe_001',
    title: 'Polite Ordering in an English Café',
    coverArtwork: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
    tags: ['Story', 'Grammar'],
    blocks: sampleCafeLesson,
  },
  {
    id: 'lesson_cafe_002',
    title: 'Handling a Wrong Order Politely',
    coverArtwork: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800',
    tags: ['Video', 'Choice'],
    blocks: lesson2Blocks,
  },
  {
    id: 'lesson_cafe_003',
    title: 'Small Talk & Paying the Bill',
    coverArtwork: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800',
    tags: ['Puzzle', 'Speed'],
    blocks: lesson3Blocks,
  },
];
