"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InteractiveCheckpointBlock as ICheckpointBlock, BlockLearnerState } from '@/types'
import { CHECKPOINT_ELASTIC_SPRING } from '@/lib/motion-tokens'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLearnerStore } from '@/store/useLearnerStore'
import { audioFeedback } from '@/lib/audio-feedback'
import { AdaptiveFeedbackBanner } from './AdaptiveFeedbackBanner'

import { SlotMatchingExercise } from './SlotMatchingExercise'
import { BranchingDecisionExercise } from './BranchingDecisionExercise'
import { MicroSprintReflexExercise } from './MicroSprintReflexExercise'
import { StoryQuestionBoxExercise } from './StoryQuestionBoxExercise'

interface Props {
  block: ICheckpointBlock
  state: BlockLearnerState
}

export function InteractiveCheckpointBlock({ block, state }: Props) {
  const submitCheckpointAnswer = useLearnerStore(state => state.submitCheckpointAnswer)
  const blockStates = useLearnerStore(state => state.blockStates)

  const handleSubmit = (id: string) => {
    submitCheckpointAnswer(block.blockId, id)
  }

  const isCompleted = state === 'completed'
  const isVerification = state === 'verification-required'
  const isRemediation = state === 'adaptive-remediation'

  const isActiveChallenge = isVerification || isRemediation

  let feedbackText = null
  let xpAwarded = 0
  let gemsAwarded = 0

  const blockState = blockStates[block.blockId]
  const attempts = blockState?.attempts || []

  if (isRemediation || isCompleted) {
    if (attempts.length > 0) {
        const lastAttempt = attempts[attempts.length - 1]
        const matchedOption = block.question.options?.find(opt => opt.id === lastAttempt.selectedOptionId)
        feedbackText = matchedOption?.feedback
        if (isCompleted && attempts.length === 1) {
            xpAwarded = block.adaptiveRules.onFirstTrySuccess.xp || 25
            gemsAwarded = block.adaptiveRules.onFirstTrySuccess.gems || 0
        } else if (isCompleted && attempts.length > 1) {
            xpAwarded = 10 // Assisted success XP
        }
    }
  }

  const handleRetry = () => {
    useLearnerStore.setState((state) => {
        const currentBlockState = state.blockStates[block.blockId]
        if (currentBlockState) {
            return {
                ...state,
                blockStates: {
                    ...state.blockStates,
                    [block.blockId]: {
                        ...currentBlockState,
                        state: 'verification-required'
                    }
                }
            }
        }
        return state
    })
  }

  // Effect to play sound when state changes to completion/remediation
  React.useEffect(() => {
    if (isCompleted) {
      if (attempts.length === 1) {
        audioFeedback.playSuccessChime()
      } else {
        audioFeedback.playAssistedSuccessChime()
      }
    } else if (isRemediation) {
      audioFeedback.playRemediationTone()
    }
  }, [state, isCompleted, isRemediation, attempts.length])

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0, y: 20 }}
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={CHECKPOINT_ELASTIC_SPRING}
      className={`
        w-full transition-all duration-500 relative
        ${isCompleted ? 'opacity-80' : ''}
      `}
    >
      {isActiveChallenge && (
        <div className="absolute -inset-1 rounded-xl bg-primary/20 animate-pulse blur-md z-0" />
      )}

      <Card className={`
        relative z-10 w-full overflow-hidden border-2
        ${isActiveChallenge ? 'border-primary/50 shadow-xl shadow-primary/10' : 'border-border/50'}
        ${isActiveChallenge ? 'backdrop-blur-sm' : ''}
      `}>
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="font-mono text-xs">
              Paused @ {block.triggerTimestamp}s
            </Badge>
            <div className="flex gap-2">
              {block.difficultyLevel && (
                <Badge variant="secondary" className="capitalize">
                  {block.difficultyLevel}
                </Badge>
              )}
              {block.xpReward && (
                <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 font-mono">
                  +{block.xpReward} XP
                </Badge>
              )}
            </div>
          </div>

          <CardTitle className="text-xl pt-2 leading-relaxed" dir="rtl">
            {block.question.prompt}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 bg-background">
          <AnimatePresence mode="wait">
            {!isActiveChallenge && !isCompleted ? (
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex justify-center items-center text-muted-foreground"
              >
                Waiting for video to reach {block.triggerTimestamp}s...
              </motion.div>
            ) : isCompleted ? (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col justify-center items-center text-primary"
              >
                <span className="text-4xl mb-4">✨</span>
                <p className="font-medium text-lg">Challenge Completed!</p>
              </motion.div>
            ) : (
              <motion.div
                key="challenge"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={CHECKPOINT_ELASTIC_SPRING}
              >
                {block.checkpointMode === 'slot_matching' && (
                  <SlotMatchingExercise block={block} onSubmit={handleSubmit} />
                )}

                {(block.checkpointMode === 'branching_decision' || block.checkpointMode === 'multiple_choice_motion') && (
                  <BranchingDecisionExercise block={block} onSubmit={handleSubmit} />
                )}

                {block.checkpointMode === 'micro_sprint_reflex' && (
                  <MicroSprintReflexExercise block={block} onSubmit={handleSubmit} state={state} />
                )}

                {block.checkpointMode === 'story_question_box' && (
                  <StoryQuestionBoxExercise block={block} onSubmit={handleSubmit} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Adaptive Feedback Banner rendered below the exercise content */}
          {(isCompleted || isRemediation) && (
             <div className="mt-6">
                <AdaptiveFeedbackBanner
                  state={state}
                  feedbackText={feedbackText || undefined}
                  smartHintText={block.adaptiveRules.onFailure.smartHintText}
                  targetPhraseEn={block.question.targetPhraseEn}
                  xpAwarded={xpAwarded}
                  gemsAwarded={gemsAwarded}
                  onSpeakNormal={() => {
                     const phrase = block.question.targetPhraseEn || block.adaptiveRules.onFailure.smartHintText
                     if (phrase) audioFeedback.speakEnglishPhrase(phrase, 1.0)
                  }}
                  onSpeakSlow={() => {
                     const phrase = block.question.targetPhraseEn || block.adaptiveRules.onFailure.smartHintText
                     if (phrase) audioFeedback.speakEnglishPhrase(phrase, 0.75)
                  }}
                  onRetry={handleRetry}
                />
             </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
