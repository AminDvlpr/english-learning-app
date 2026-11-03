export interface AttemptRecord {
  timestamp: number;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface RiveSignals {
  isCorrect: boolean | null;
  difficultyLevel: number; // e.g. 1 for beginner, 2 intermediate, 3 advanced
  triggerName: string | null;
  resetCounter: number;
}

export interface BlockRuntimeState {
  blockId: string;
  state: 'locked' | 'active' | 'verification-required' | 'adaptive-remediation' | 'completed';
  attempts: AttemptRecord[];
  isHintActive: boolean;
}
