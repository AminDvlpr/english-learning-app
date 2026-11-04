import * as React from "react"
import { LessonBlock, HeadingIntroBlock, CalloutBlock, MotionCanvasBlock, InteractiveCheckpointBlock, ToggleTableBlock, AdaptiveTransition } from "@/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BlockEditorFormProps {
  block: LessonBlock
  onChange: (block: LessonBlock) => void
}

export function BlockEditorForm({ block, onChange }: BlockEditorFormProps) {

  const handleTextChange = (field: string, value: string) => {
    onChange({ ...block, [field]: value } as LessonBlock)
  }

  const handleNumberChange = (field: string, value: string) => {
    onChange({ ...block, [field]: Number(value) } as LessonBlock)
  }

  const renderHeadingIntroFields = (b: HeadingIntroBlock) => (
    <>
      <div className="space-y-1">
        <Label>Title</Label>
        <Input value={b.title} onChange={(e) => handleTextChange('title', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Subtitle</Label>
        <Input value={b.subtitle} onChange={(e) => handleTextChange('subtitle', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Topic Tag</Label>
        <Input value={b.topicTag} onChange={(e) => handleTextChange('topicTag', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Icon Identifier</Label>
        <Input value={b.iconIdentifier} onChange={(e) => handleTextChange('iconIdentifier', e.target.value)} />
      </div>
    </>
  )

  const renderCalloutFields = (b: CalloutBlock) => (
    <>
      <div className="space-y-1">
        <Label>Variant</Label>
        <select
          className="w-full p-2 border rounded-md"
          value={b.variant}
          onChange={(e) => handleTextChange('variant', e.target.value)}
        >
          <option value="golden_tip">Golden Tip</option>
          <option value="grammar_warning">Grammar Warning</option>
          <option value="cultural_note">Cultural Note</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label>Title</Label>
        <Input value={b.title} onChange={(e) => handleTextChange('title', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Content</Label>
        <Input value={b.content} onChange={(e) => handleTextChange('content', e.target.value)} />
      </div>
      <div className="space-y-1 border p-2 rounded">
         <Label>Bilingual Example (Optional)</Label>
         <Input placeholder="English" value={b.bilingualExample?.en || ''} onChange={(e) => onChange({ ...b, bilingualExample: { ...b.bilingualExample, en: e.target.value, fa: b.bilingualExample?.fa || '' } })} className="mb-2"/>
         <Input placeholder="Persian" value={b.bilingualExample?.fa || ''} onChange={(e) => onChange({ ...b, bilingualExample: { ...b.bilingualExample, fa: e.target.value, en: b.bilingualExample?.en || '' } })}/>
      </div>
    </>
  )

  const renderMotionCanvasFields = (b: MotionCanvasBlock) => (
    <>
      <div className="space-y-1">
        <Label>Motion Scene ID</Label>
        <Input value={b.motionSceneId} onChange={(e) => handleTextChange('motionSceneId', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Asset Path</Label>
        <Input value={b.assetPath} onChange={(e) => handleTextChange('assetPath', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Max Continuous Duration (Sec)</Label>
        <Input type="number" value={b.maxContinuousDurationSec} onChange={(e) => handleNumberChange('maxContinuousDurationSec', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Trigger Timestamp</Label>
        <Input type="number" value={b.triggerTimestamp || ''} onChange={(e) => handleNumberChange('triggerTimestamp', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Caption</Label>
        <Input value={b.caption || ''} onChange={(e) => handleTextChange('caption', e.target.value)} />
      </div>
    </>
  )

  const renderInteractiveCheckpointFields = (b: InteractiveCheckpointBlock) => (
    <>
      <div className="space-y-1">
        <Label>Checkpoint Mode</Label>
        <select
          className="w-full p-2 border rounded-md"
          value={b.checkpointMode}
          onChange={(e) => handleTextChange('checkpointMode', e.target.value)}
        >
          <option value="multiple_choice_motion">Multiple Choice Motion</option>
          <option value="slot_matching">Slot Matching</option>
          <option value="branching_decision">Branching Decision</option>
          <option value="micro_sprint_reflex">Micro Sprint Reflex</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label>Motion Scene ID</Label>
        <Input value={b.motionSceneId} onChange={(e) => handleTextChange('motionSceneId', e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Trigger Timestamp</Label>
        <Input type="number" value={b.triggerTimestamp} onChange={(e) => handleNumberChange('triggerTimestamp', e.target.value)} />
      </div>

      <div className="mt-4 p-3 border rounded-md space-y-3">
        <h4 className="font-semibold text-sm">Question</h4>
        <div className="space-y-1">
          <Label>Prompt</Label>
          <Input value={b.question.prompt} onChange={(e) => onChange({ ...b, question: { ...b.question, prompt: e.target.value } })} />
        </div>
        <div className="space-y-1">
          <Label>Time Limit (Sec, optional)</Label>
          <Input type="number" value={b.question.timeLimitSec || ''} onChange={(e) => onChange({ ...b, question: { ...b.question, timeLimitSec: Number(e.target.value) } })} />
        </div>
        {/* Simple options editor */}
        <div className="space-y-2">
           <Label>Options ({b.question.options?.length || 0})</Label>
           {b.question.options?.map((opt, i) => (
              <div key={opt.id} className="flex flex-col gap-2 p-2 border rounded">
                 <div className="flex gap-2 items-center">
                   <input type="checkbox" checked={opt.correct} onChange={(e) => {
                      const newOptions = [...b.question.options]
                      newOptions[i].correct = e.target.checked
                      onChange({ ...b, question: { ...b.question, options: newOptions } })
                   }}/>
                   <Input className="flex-1" placeholder="Option text" value={opt.text} onChange={(e) => {
                      const newOptions = [...b.question.options]
                      newOptions[i].text = e.target.value
                      onChange({ ...b, question: { ...b.question, options: newOptions } })
                   }}/>
                 </div>
                 <Input className="w-full text-xs" placeholder="Diagnostic feedback" value={opt.feedback || ''} onChange={(e) => {
                    const newOptions = [...b.question.options]
                    newOptions[i].feedback = e.target.value
                    onChange({ ...b, question: { ...b.question, options: newOptions } })
                 }}/>
              </div>
           ))}
        </div>
        <div className="space-y-2">
           <Label>Slots ({b.question.slots?.length || 0})</Label>
           {b.question.slots?.map((slot, i) => (
              <div key={slot.id} className="flex gap-2 items-center p-2 border rounded">
                 <Input className="flex-1" placeholder="Expected slot text" value={slot.expected} onChange={(e) => {
                    const newSlots = [...(b.question.slots || [])]
                    newSlots[i].expected = e.target.value
                    onChange({ ...b, question: { ...b.question, slots: newSlots } })
                 }}/>
              </div>
           ))}
        </div>
      </div>

      <div className="mt-4 p-3 border rounded-md space-y-3">
        <h4 className="font-semibold text-sm">Adaptive Rules (Success)</h4>
        <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1">
             <Label>XP Reward</Label>
             <Input type="number" value={b.adaptiveRules.onFirstTrySuccess.xp} onChange={(e) => onChange({ ...b, adaptiveRules: { ...b.adaptiveRules, onFirstTrySuccess: { ...b.adaptiveRules.onFirstTrySuccess, xp: Number(e.target.value) } } })} />
           </div>
           <div className="space-y-1">
             <Label>Gems</Label>
             <Input type="number" value={b.adaptiveRules.onFirstTrySuccess.gems} onChange={(e) => onChange({ ...b, adaptiveRules: { ...b.adaptiveRules, onFirstTrySuccess: { ...b.adaptiveRules.onFirstTrySuccess, gems: Number(e.target.value) } } })} />
           </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1">
             <Label>Mastery Delta</Label>
             <Input value={String(b.adaptiveRules.onFirstTrySuccess.masteryDelta || '')} onChange={(e) => onChange({ ...b, adaptiveRules: { ...b.adaptiveRules, onFirstTrySuccess: { ...b.adaptiveRules.onFirstTrySuccess, masteryDelta: e.target.value } } })} />
           </div>
           <div className="space-y-1">
             <Label>Next Difficulty</Label>
             <select
               className="w-full p-2 border rounded-md"
               value={b.adaptiveRules.onFirstTrySuccess.nextDifficulty}
               onChange={(e) => onChange({ ...b, adaptiveRules: { ...b.adaptiveRules, onFirstTrySuccess: { ...b.adaptiveRules.onFirstTrySuccess, nextDifficulty: e.target.value as AdaptiveTransition } } })}
             >
               <option value="easier">Easier</option>
               <option value="same">Same</option>
               <option value="harder">Harder</option>
             </select>
           </div>
        </div>
      </div>
      <div className="mt-4 p-3 border rounded-md space-y-3">
        <h4 className="font-semibold text-sm">Adaptive Rules (Failure)</h4>
        <div className="flex items-center gap-2">
           <input type="checkbox" checked={b.adaptiveRules.onFailure.triggerRemediationAnimation} onChange={(e) => onChange({ ...b, adaptiveRules: { ...b.adaptiveRules, onFailure: { ...b.adaptiveRules.onFailure, triggerRemediationAnimation: e.target.checked } } })} />
           <Label>Trigger Remediation Animation</Label>
        </div>
        <div className="flex items-center gap-2">
           <input type="checkbox" checked={b.adaptiveRules.onFailure.provideSmartHint} onChange={(e) => onChange({ ...b, adaptiveRules: { ...b.adaptiveRules, onFailure: { ...b.adaptiveRules.onFailure, provideSmartHint: e.target.checked } } })} />
           <Label>Provide Smart Hint</Label>
        </div>
        <div className="space-y-1">
           <Label>Smart Hint Text</Label>
           <Input value={b.adaptiveRules.onFailure.smartHintText || ''} onChange={(e) => onChange({ ...b, adaptiveRules: { ...b.adaptiveRules, onFailure: { ...b.adaptiveRules.onFailure, smartHintText: e.target.value } } })} />
        </div>
        <div className="space-y-1">
          <Label>Adjust Difficulty</Label>
          <select
            className="w-full p-2 border rounded-md"
            value={b.adaptiveRules.onFailure.adjustDifficulty}
            onChange={(e) => onChange({ ...b, adaptiveRules: { ...b.adaptiveRules, onFailure: { ...b.adaptiveRules.onFailure, adjustDifficulty: e.target.value as AdaptiveTransition } } })}
          >
            <option value="easier">Easier</option>
            <option value="same">Same</option>
            <option value="harder">Harder</option>
          </select>
        </div>
      </div>
    </>
  )

  const renderToggleTableFields = (b: ToggleTableBlock) => (
    <div className="space-y-4">
      <div className="p-3 border rounded space-y-2">
         <Label>Headers (comma separated)</Label>
         <Input value={b.table.headers.join(',')} onChange={(e) => {
           onChange({ ...b, table: { ...b.table, headers: e.target.value.split(',').map(s => s.trim()) } })
         }} />
      </div>
      <div className="p-3 border rounded space-y-2">
         <Label>Rows (each row on a new line, columns comma separated)</Label>
         <textarea className="w-full p-2 border rounded text-sm font-mono" rows={5} value={b.table.rows.map(r => r.join(',')).join('\n')} onChange={(e) => {
           onChange({ ...b, table: { ...b.table, rows: e.target.value.split('\n').map(r => r.split(',').map(c => c.trim())) } })
         }} />
      </div>
    </div>
  )

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
          <span>Edit Properties</span>
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{block.type}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="space-y-1">
          <Label>Block ID</Label>
          <Input value={block.blockId} onChange={(e) => handleTextChange('blockId', e.target.value)} />
        </div>

        {block.type === 'heading_intro' && renderHeadingIntroFields(block as HeadingIntroBlock)}
        {block.type === 'callout' && renderCalloutFields(block as CalloutBlock)}
        {block.type === 'motion_canvas' && renderMotionCanvasFields(block as MotionCanvasBlock)}
        {block.type === 'interactive_checkpoint' && renderInteractiveCheckpointFields(block as InteractiveCheckpointBlock)}
        {block.type === 'toggle_table' && renderToggleTableFields(block as ToggleTableBlock)}

      </CardContent>
    </Card>
  )
}
