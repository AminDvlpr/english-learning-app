export type StorySlideFormat = 'read' | 'watch' | 'listen' | 'play';

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
