"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InteractiveCheckpointBlock as ICheckpointBlock, BlockLearnerState } from '@/types'
import { CHECKPOINT_ELASTIC_SPRING } from '@/lib/motion-tokens'


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
  const triggerCheckpointVerification = useLearnerStore(state => state.triggerCheckpointVerification)
  const blockStates = useLearnerStore(state => state.blockStates)

  const handleSubmit = (id: string) => {
    if (state === 'locked' || state === 'active') {
      triggerCheckpointVerification(block.blockId)
    }
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

      <div className="w-full text-white pb-6 px-4 z-50">
        <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {block.difficultyLevel && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full capitalize">
                  {block.difficultyLevel}
                </span>
              )}
              {block.xpReward && (
                <span className="text-xs bg-primary/40 text-white font-mono px-2 py-1 rounded-full">
                  +{block.xpReward} XP
                </span>
              )}
            </div>
          </div>
          <h3 className="text-xl font-bold mb-4 leading-relaxed drop-shadow-md" dir="rtl">
            {block.question.prompt}
          </h3>

        <div>
          <AnimatePresence mode="wait">
            {isCompleted ? (
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
        </div>
      </div>
    </motion.div>
  )
}
