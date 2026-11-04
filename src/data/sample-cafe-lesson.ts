import { LessonBlock } from '@/types';

export const sampleCafeLesson: LessonBlock[] = [
  {
    type: 'heading_intro',
    blockId: 'blk_intro_001',
    order: 1,
    title: 'Polite Ordering in an English Café',
    subtitle: 'Learn how to order your favorite coffee with confidence and politeness.',
    topicTag: 'Conversation',
    iconIdentifier: 'coffee',
    estimatedDuration: 5,
    difficultyLevel: 'beginner',
  },
  {
    type: 'motion_canvas',
    blockId: 'blk_video_002',
    order: 2,
    motionSceneId: 'scene_cafe_ordering',
    assetPath: '/assets/rive/cafe-scene.riv',
    maxContinuousDurationSec: 15,
    caption: 'Watch and listen to a formal coffee ordering scenario.',
    scrollSyncMarkers: [
      { timestamp: 2.0, markerName: 'greeting' },
      { timestamp: 3.0, markerName: 'ordering' },
    ],
    triggerTimestamp: 4.0,
  },
  {
    type: 'callout',
    blockId: 'blk_tip_003',
    order: 3,
    variant: 'cultural_note',
    title: 'Politeness Matters',
    content: 'In English-speaking countries, adding "please" and "I would like" instead of "I want" makes a huge difference in formal situations.',
    bilingualExample: {
      en: 'I would like a cappuccino, please.',
      fa: 'لطفاً یک کاپوچینو می‌خواستم.',
    },
  },
  {
    type: 'interactive_checkpoint',
    blockId: 'blk_eng_042',
    order: 4,
    checkpointMode: 'branching_decision',
    motionSceneId: 'scene_cafe_ordering',
    triggerTimestamp: 4.0,
    difficultyLevel: 'intermediate',
    xpReward: 15,
    question: {
      prompt: 'کدام عبارت برای سفارش قهوه در موقعیت رسمی مؤدبانه‌تر است؟',
      targetPhraseEn: 'I would like a coffee, please.',
      timeLimitSec: 30,
      options: [
        { id: 'opt_1', text: 'Give me a coffee.', correct: false, feedback: 'Too direct and impolite.' },
        { id: 'opt_2', text: 'I want a coffee now.', correct: false, feedback: 'Very demanding.' },
        { id: 'opt_3', text: 'I would like a coffee, please.', correct: true, feedback: 'Perfect! Very polite and formal.' },
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
        smartHintText: 'Look for phrases that include "would like" and "please".',
      },
    },
  },
  {
    type: 'interactive_checkpoint',
    blockId: 'blk_chk_005',
    order: 5,
    checkpointMode: 'slot_matching',
    motionSceneId: 'scene_cafe_ordering',
    triggerTimestamp: 9.0,
    difficultyLevel: 'beginner',
    question: {
      prompt: 'جای خالی را با کلمه مناسب پر کنید.',
      options: [],
      slots: [
        { id: 'slot_1', expected: 'would' },
        { id: 'slot_2', expected: 'please' },
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
        smartHintText: 'Remember the polite modal verb.',
      },
    },
  },
  {
    type: 'interactive_checkpoint',
    blockId: 'blk_chk_008',
    order: 6,
    checkpointMode: 'story_question_box',
    motionSceneId: 'scene_cafe_ordering',
    triggerTimestamp: 14.0,
    difficultyLevel: 'intermediate',
    xpReward: 25,
    question: {
      prompt: 'What can I get started for you today?',
      targetPhraseEn: 'I would like a coffee, please.',
      options: [
        { id: 'h_1', text: 'Could I have', correct: false, feedback: '' },
        { id: 'h_2', text: 'I would like', correct: false, feedback: '' },
        { id: 'h_3', text: 'a coffee', correct: false, feedback: '' },
        { id: 'h_4', text: 'please', correct: false, feedback: '' },
        { id: 'ans_true', text: 'I would like a coffee, please.', correct: true, feedback: 'Perfect English!' }
      ]
    },
    adaptiveRules: {
      onFirstTrySuccess: {
        xp: 30,
        gems: 10,
        masteryDelta: 'max',
        nextDifficulty: 'harder'
      },
      onFailure: {
        triggerRemediationAnimation: true,
        provideSmartHint: true,
        adjustDifficulty: 'easier',
        smartHintText: 'Use polite markers like "could", "would like", or "please".'
      }
    }
  },
  {
    type: 'toggle_table',
    blockId: 'blk_tbl_007',
    order: 7,
    items: [
      {
        title: 'Polite vs. Direct',
        body: 'Comparing polite requests with direct commands.',
        examples: [
          { en: 'I would like a tea.', fa: 'من یک چای می‌خواهم (مؤدبانه).' },
          { en: 'I want a tea.', fa: 'من یک چای می‌خواهم (مستقیم).' },
        ],
      },
    ],
    table: {
      headers: ['Context', 'English Phrase', 'Tone'],
      rows: [
        ['Formal', 'Could I have a latte, please?', 'Very Polite'],
        ['Casual', 'Can I get a latte?', 'Friendly/Casual'],
        ['Direct', 'I want a latte.', 'Impolite'],
      ],
    },
  },
];
