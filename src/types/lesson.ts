export type BlockLearnerState =
  | 'locked'
  | 'active'
  | 'verification-required'
  | 'adaptive-remediation'
  | 'completed';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type AdaptiveTransition = 'easier' | 'same' | 'harder';

export interface BaseBlock {
  blockId: string;
  order: number;
  difficultyLevel?: DifficultyLevel;
  xpReward?: number;
}

export interface HeadingIntroBlock extends BaseBlock {
  type: 'heading_intro';
  title: string;
  subtitle: string;
  topicTag: string;
  iconIdentifier: string;
  estimatedDuration: number;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: 'golden_tip' | 'grammar_warning' | 'cultural_note';
  title: string;
  content: string;
  bilingualExample?: {
    en: string;
    fa: string;
  };
}

export interface MotionCanvasBlock extends BaseBlock {
  type: 'motion_canvas';
  motionSceneId: string;
  assetPath: string; // Rive asset path or vector scene key
  maxContinuousDurationSec: number; // Enforced <= 60s
  caption?: string;
  scrollSyncMarkers?: Array<{ timestamp: number; markerName: string }>;
  triggerTimestamp?: number;
}

export interface InteractiveCheckpointBlock extends BaseBlock {
  type: 'interactive_checkpoint';
  checkpointMode: 'multiple_choice_motion' | 'slot_matching' | 'branching_decision' | 'micro_sprint_reflex';
  motionSceneId: string;
  triggerTimestamp: number;
  question: {
    prompt: string;
    targetPhraseEn?: string;
    timeLimitSec?: number;
    options: Array<{ id: string; text: string; correct: boolean; feedback: string }>;
    slots?: Array<{ id: string; expected: string }>; // Adjust based on requirement
  };
  adaptiveRules: {
    onFirstTrySuccess: {
      xp: number;
      gems: number;
      masteryDelta: string | number;
      nextDifficulty: AdaptiveTransition;
    };
    onFailure: {
      triggerRemediationAnimation: boolean;
      provideSmartHint: boolean;
      adjustDifficulty: AdaptiveTransition;
      smartHintText?: string;
    };
  };
}

export interface ToggleTableBlock extends BaseBlock {
  type: 'toggle_table';
  items: Array<{
    title: string;
    body: string;
    examples?: Array<{ en: string; fa: string }>;
  }>;
  table: {
    headers: Array<string>;
    rows: Array<Array<string>>;
  };
}

export type LessonBlock =
  | HeadingIntroBlock
  | CalloutBlock
  | MotionCanvasBlock
  | InteractiveCheckpointBlock
  | ToggleTableBlock;
