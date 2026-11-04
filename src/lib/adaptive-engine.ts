import { InteractiveCheckpointBlock, DifficultyLevel, AdaptiveTransition, BlockLearnerState } from '@/types';

export interface EvaluationResult {
  isCorrect: boolean;
  xpAwarded: number;
  gemsAwarded: number;
  masteryDelta: number;
  nextDifficulty: AdaptiveTransition;
  nextState: BlockLearnerState;
  triggerRemediationAnimation: boolean;
  provideSmartHint: boolean;
  feedback?: string;
}

function parseMasteryDelta(delta: string | number): number {
  if (typeof delta === 'number') return delta;
  switch (delta.toLowerCase()) {
    case 'high': return 0.25;
    case 'max': return 0.50;
    case 'low': return 0.10;
    default: return 0.10;
  }
}

export function evaluateCheckpointAttempt(
  block: InteractiveCheckpointBlock,
  selectedOptionId: string,
  attemptCount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _currentDifficulty: DifficultyLevel
): EvaluationResult {
  let isCorrect = false;
  let feedback: string | undefined = undefined;

  if (block.checkpointMode === 'slot_matching') {
    const expected = block.question.slots?.map(s => s.expected) || [];
    isCorrect = selectedOptionId === JSON.stringify(expected);
  } else if (block.checkpointMode === 'micro_sprint_reflex' && selectedOptionId === 'timeout') {
    isCorrect = false;
  } else if (block.checkpointMode === 'story_question_box') {
    const normalizedInput = String(selectedOptionId).toLowerCase();
    const politeMarkers = ["could", "would like", "please", "may i", "can i have"];

    // Find correct option to match against its text
    const correctOption = block.question.options?.find(opt => opt.correct);

    const hasPoliteMarker = politeMarkers.some(marker => normalizedInput.includes(marker));
    const matchesCorrectText = correctOption && normalizedInput === correctOption.text.toLowerCase();

    isCorrect = hasPoliteMarker || matchesCorrectText || false;

    if (!isCorrect) {
      feedback = "شما باید درخواست خود را مؤدبانه بیان کنید. می‌توانید از کلماتی مانند «Could I please have...» یا «I would like...» استفاده کنید.";
    }
  } else {
    const option = block.question.options?.find(opt => opt.id === selectedOptionId);
    isCorrect = option?.correct || false;
    feedback = option?.feedback;
  }

  if (isCorrect) {
    if (attemptCount === 1) {
      return {
        isCorrect: true,
        xpAwarded: block.adaptiveRules.onFirstTrySuccess.xp || 25,
        gemsAwarded: block.adaptiveRules.onFirstTrySuccess.gems || 0,
        masteryDelta: parseMasteryDelta(block.adaptiveRules.onFirstTrySuccess.masteryDelta),
        nextDifficulty: block.adaptiveRules.onFirstTrySuccess.nextDifficulty,
        nextState: 'completed',
        triggerRemediationAnimation: false,
        provideSmartHint: false,
        feedback: feedback
      };
    } else {
      return {
        isCorrect: true,
        xpAwarded: 10,
        gemsAwarded: 0,
        masteryDelta: 0.10,
        nextDifficulty: 'same',
        nextState: 'completed',
        triggerRemediationAnimation: false,
        provideSmartHint: false,
        feedback: feedback
      };
    }
  } else {
    return {
      isCorrect: false,
      xpAwarded: 0,
      gemsAwarded: 0,
      masteryDelta: 0,
      nextDifficulty: block.adaptiveRules.onFailure.adjustDifficulty,
      nextState: 'adaptive-remediation',
      triggerRemediationAnimation: block.adaptiveRules.onFailure.triggerRemediationAnimation,
      provideSmartHint: block.adaptiveRules.onFailure.provideSmartHint,
      feedback: feedback || block.adaptiveRules.onFailure.smartHintText
    };
  }
}
