import React, { useEffect, useState } from 'react';
import { useLearnerStore } from '@/store/useLearnerStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function LearnerStateInspector() {
  const store = useLearnerStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useLearnerStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const {
    blockStates,
    currentDifficulty,
    masteryScore,
    xp,
    riveSignals,
    lessonBlocks,
    completeContentBlock,
    triggerCheckpointVerification,
    submitCheckpointAnswer,
    requestSmartHint,
    resetLesson
  } = store;

  const getStateColor = (state: string) => {
    switch (state) {
      case 'locked': return 'bg-gray-200 text-gray-500';
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'verification-required': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'adaptive-remediation': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100';
    }
  };

  return (
    <Card className="w-full max-w-sm sticky top-24 border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-muted/50 pb-4 border-b">
        <CardTitle className="flex justify-between items-center text-sm font-bold">
          <span>Learner Engine</span>
          <Badge variant="outline">{currentDifficulty}</Badge>
        </CardTitle>
        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
          <span>XP: {xp}</span>
          <span>Mastery: {(masteryScore * 100).toFixed(0)}%</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Block States</h4>
          {lessonBlocks.map((block) => {
            const bState = blockStates[block.blockId];
            if (!bState) return null;

            const isCheckpoint = block.type === 'interactive_checkpoint';

            return (
              <div key={block.blockId} className="border rounded-md p-3 text-sm space-y-2">
                <div className="flex justify-between items-start">
                   <div className="truncate w-32 font-medium" title={block.blockId}>
                       {block.type.replace('_', ' ')}
                   </div>
                   <Badge className={`${getStateColor(bState.state)} capitalize text-[10px]`}>
                      {bState.state}
                   </Badge>
                </div>

                {bState.state === 'active' && !isCheckpoint && (
                    <Button size="sm" className="w-full h-7 text-xs" onClick={() => completeContentBlock(block.blockId)}>
                        Complete Block
                    </Button>
                )}

                {bState.state === 'active' && isCheckpoint && (
                     <Button size="sm" variant="secondary" className="w-full h-7 text-xs" onClick={() => triggerCheckpointVerification(block.blockId)}>
                        Trigger Verification
                     </Button>
                )}

                {(bState.state === 'verification-required' || bState.state === 'adaptive-remediation') && isCheckpoint && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                         {/* Simulate answering options */}
                         {block.question?.options?.map((opt: {id: string, correct: boolean}) => (
                             <Button
                                key={opt.id}
                                size="sm"
                                variant={opt.correct ? 'default' : 'destructive'}
                                className="h-7 text-xs truncate"
                                onClick={() => submitCheckpointAnswer(block.blockId, opt.id)}
                             >
                                 {opt.correct ? 'Correct' : 'Wrong'}
                             </Button>
                         ))}
                    </div>
                )}

                {bState.state === 'adaptive-remediation' && !bState.isHintActive && (
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs mt-2" onClick={() => requestSmartHint(block.blockId)}>
                        Request Hint
                    </Button>
                )}
                {bState.isHintActive && (
                    <div className="text-xs mt-2 bg-muted p-1.5 rounded border border-border">
                        Hint active!
                    </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="pt-2 border-t space-y-2">
           <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rive Signals</h4>
           <pre className="text-[10px] bg-muted p-2 rounded overflow-hidden">
               {JSON.stringify(riveSignals, null, 2)}
           </pre>
        </div>

        <Button variant="destructive" size="sm" className="w-full mt-4" onClick={resetLesson}>
            Reset Lesson
        </Button>
      </CardContent>
    </Card>
  );
}
