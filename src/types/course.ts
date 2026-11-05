export type StorySlideFormat = 'read' | 'watch' | 'listen' | 'play';

export type PuppetExpression = 'neutral' | 'happy' | 'mocking' | 'strict_frown' | 'nervous' | 'proud';

export interface PuppetCharacterConfig {
  id: string;
  name: 'Amin' | 'Sara' | 'Uncle' | 'Teacher' | 'Officer';
  labelFa: string;
  xPercent: number;
  expression: PuppetExpression;
  isSpeaking?: boolean;
  isWalking?: boolean;
  customPngLayers?: {
    bodyUrl?: string;
    headUrl?: string;
    mouthOpenUrl?: string;
    eyesBlinkUrl?: string;
  };
}

export interface ParallaxLayerConfig {
  backgroundUrl?: string;
  midgroundUrl?: string;
  foregroundUrl?: string;
  theme: 'childhood_class' | 'painting_studio' | 'uncle_tea_room' | 'immigration_office' | 'london_apartment';
}

export interface InvestigableHotspot {
  id: string;
  labelEn: string;
  labelFa: string;
  emoji: string;
  xPercent: number;
  yPercent: number;
  lookMonologueEn: string;
  lookMonologueFa: string;
  canGrabToInventory?: boolean;
  isDropTarget?: boolean;
  requiredItemId?: string;
  successNodeId?: string;
  wrongItemNodeId?: string;
}

export interface DocumentFieldError {
  id: string;
  fieldLabel: string;
  wrongValue: string;
  correctOptions: string[];
  correctValue: string;
  hintFa: string;
}

export interface StoryGraphNode {
  id: string;
  type: 'narrative' | 'pressure_choice' | 'investigation' | 'document_inspection';
  cameraFocus?: 'speaker_zoom' | 'pressure_closeup' | 'wide_explore';
  speaker?: 'Amin' | 'Sara' | 'Uncle' | 'Teacher' | 'Officer';
  dialogueEn?: string;
  dialogueFa?: string;
  puppets?: PuppetCharacterConfig[];
  nextNodeId?: string;
  timerSec?: number;
  silenceConsequence?: {
    feedbackFa: string;
    approvalDelta?: number;
    targetExpression?: PuppetExpression;
    nextNodeId: string;
  };
  choices?: {
    id: string;
    textEn: string;
    textFa: string;
    isCorrect: boolean;
    approvalDelta?: number;
    flagKey?: string;
    feedbackFa: string;
    targetExpression?: PuppetExpression;
    nextNodeId: string;
  }[];
  hotspots?: InvestigableHotspot[];
  documentInspection?: {
    documentTitle: string;
    instructionsFa: string;
    fields: DocumentFieldError[];
    successNextNodeId: string;
  };
}

export interface LeitnerFlashcard {
  id: string;
  wordOrPhrase: string;
  translationFa: string;
  explanationFa: string;
  exampleEn?: string;
  boxNumber: 1 | 2 | 3 | 4 | 5;
  nextReviewAt: number;
  sourceLessonTitle?: string;
}

export interface DeepDiveAnnotation {
  id: string;
  triggerText: string;
  title: string;
  category: 'grammar' | 'etymology' | 'cultural' | 'pronunciation';
  explanationFa: string;
  examples: { en: string; fa: string }[];
}

export type PlayInterruptActionType = 'drag_and_drop' | 'select' | 'walk_away';

export interface SceneHotspotObject {
  id: string;
  label: string;
  emoji: string;
  xPercent: number;
  yPercent: number;
  isDraggable?: boolean;
  isDropTarget?: boolean;
}

export interface SlideInterrupt {
  id: string;
  triggerAtPercentOrSec: number;
  actionType: 'drag_and_drop' | 'select' | 'walk_away' | 'slot_fill' | 'voice_reply';
  promptFa: string;
  promptEn?: string;
  sourceObjectId?: string;
  targetObjectId?: string;
  options?: {
    id: string;
    textEn: string;
    textFa?: string;
    isCorrect: boolean;
    feedbackFa: string;
    consequenceTextEn?: string;
  }[];
  walkAwayLabelEn?: string;
  walkAwayDestination?: string;
}

export interface CourseSlide {
  id: string;
  order: number;
  format: StorySlideFormat;
  title: string;
  chapterBadge: string;
  videoUrl?: string;
  notionHeader?: {
    coverGradient: string;
    iconEmoji: string;
    quoteBarText: string;
    metadata: { language: string; level: string; chapter: string; characters: string };
  };
  kineticParagraphs?: {
    id: string;
    textEn: string;
    highlightWords: {
      word: string;
      color: 'purple' | 'magenta' | 'emerald' | 'cyan';
      hasSparkle?: boolean;
    }[];
    translationFa: string;
  }[];
  playScene?: {
    backgroundTheme: 'childhood_class' | 'uncle_living_room' | 'london_apartment' | 'cafe_counter';
    characters: { name: 'Amin' | 'Sara' | 'Uncle' | 'Landlord'; mood: string; dialogueEn: string; dialogueFa: string }[];
    objects: SceneHotspotObject[];
  };
  audioScript?: {
    speaker: string;
    textEn: string;
    textFa: string;
    durationSec: number;
  }[];
  videoDurationSec?: number;
  parallaxScene?: ParallaxLayerConfig;
  hasApprovalMeter?: boolean;
  initialApproval?: number;
  storyNodes?: StoryGraphNode[];
  deepDives: DeepDiveAnnotation[];
  interrupts: SlideInterrupt[];
}

export interface LessonSummaryStash {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
  keyPhrases: { en: string; fa: string; grammarNoteFa: string }[];
  takeawayFa: string;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  order: number;
  chapterNumber: 1 | 2 | 3;
  chapterTitleFa: string;
  title: string;
  subtitleFa: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  coverEmoji: string;
  coverGradient: string;
  formatTags: StorySlideFormat[];
  estimatedMinutes: number;
  isFeatured?: boolean;
  viewsCount?: string;
  slides: CourseSlide[];
  summaryStash: LessonSummaryStash;
}

export interface CourseDocument {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  levelRange: string;
  coverEmoji: string;
  coverGradient: string;
  isDefaultEnrolled?: boolean;
  isFeatured?: boolean;
  viewsCount?: string;
  lessons: CourseLesson[];
}
