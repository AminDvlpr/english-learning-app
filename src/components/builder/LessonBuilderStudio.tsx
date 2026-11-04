"use client"

import * as React from "react"
import { sampleCafeLesson } from "@/data/sample-cafe-lesson"
import { LessonBlock } from "@/types"
import { SmartLessonRenderer } from "@/components/canvas/SmartLessonRenderer"
import { BlockEditorForm } from "./BlockEditorForm"
import { JsonSchemaInspector } from "./JsonSchemaInspector"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useLearnerStore } from "@/store/useLearnerStore"
import { Plus, Trash2, Copy } from "lucide-react"

export function LessonBuilderStudio() {
  const [blocks, setBlocks] = React.useState<LessonBlock[]>(sampleCafeLesson)
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null)
  const initializeLesson = useLearnerStore(state => state.initializeLesson)

  // Only initialize the lesson on mount, to prevent resetting progress on every keystroke
  React.useEffect(() => {
    initializeLesson('lesson_builder_preview', blocks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBlockChange = (updatedBlock: LessonBlock) => {
    setBlocks(prev => prev.map(b => b.blockId === updatedBlock.blockId ? updatedBlock : b))
  }

  const handleAddBlock = (type: LessonBlock['type']) => {
    const newId = `blk_${type}_${Date.now()}`
    const baseBlock = {
      blockId: newId,
      order: blocks.length + 1,
      type,
    } as LessonBlock

    // Provide sensible defaults based on type
    let newBlock: LessonBlock = baseBlock
    switch (type) {
      case 'heading_intro':
        newBlock = { ...baseBlock, type: 'heading_intro', title: 'New Heading', subtitle: '', topicTag: 'General', iconIdentifier: 'info', estimatedDuration: 1 }
        break
      case 'callout':
        newBlock = { ...baseBlock, type: 'callout', variant: 'cultural_note', title: 'Note', content: 'New callout content.' }
        break
      case 'motion_canvas':
        newBlock = { ...baseBlock, type: 'motion_canvas', motionSceneId: 'scene_new', assetPath: '', maxContinuousDurationSec: 10 }
        break
      case 'interactive_checkpoint':
        newBlock = {
          ...baseBlock,
          type: 'interactive_checkpoint',
          checkpointMode: 'multiple_choice_motion',
          motionSceneId: 'scene_new',
          triggerTimestamp: 0,
          question: { prompt: 'New Question', options: [] },
          adaptiveRules: {
            onFirstTrySuccess: { xp: 10, gems: 1, masteryDelta: 1, nextDifficulty: 'same' },
            onFailure: { triggerRemediationAnimation: true, provideSmartHint: true, adjustDifficulty: 'same' }
          }
        }
        break
      case 'toggle_table':
        newBlock = { ...baseBlock, type: 'toggle_table', items: [], table: { headers: [], rows: [] } }
        break
    }

    setBlocks(prev => [...prev, newBlock])
    setSelectedBlockId(newId)
  }

  const handleDeleteBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setBlocks(prev => prev.filter(b => b.blockId !== id).map((b, i) => ({ ...b, order: i + 1 })))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (index === 0) return
    setBlocks(prev => {
      const newBlocks = [...prev]
      const temp = newBlocks[index]
      newBlocks[index] = newBlocks[index - 1]
      newBlocks[index - 1] = temp
      // reassign orders
      return newBlocks.map((b, i) => ({ ...b, order: i + 1 }))
    })
  }

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (index === blocks.length - 1) return
    setBlocks(prev => {
      const newBlocks = [...prev]
      const temp = newBlocks[index]
      newBlocks[index] = newBlocks[index + 1]
      newBlocks[index + 1] = temp
      // reassign orders
      return newBlocks.map((b, i) => ({ ...b, order: i + 1 }))
    })
  }

  const handleDuplicate = (block: LessonBlock, index: number, e: React.MouseEvent) => {
     e.stopPropagation()
     const newId = `${block.blockId}_copy_${Date.now()}`
     const newBlock = { ...block, blockId: newId }
     setBlocks(prev => {
        const newBlocks = [...prev]
        newBlocks.splice(index + 1, 0, newBlock)
        return newBlocks.map((b, i) => ({ ...b, order: i + 1 }))
     })
  }

  const handleSaveLesson = () => {
     try {
       const existingStr = localStorage.getItem('custom_lessons') || '[]'
       const existing = JSON.parse(existingStr)
       const newLesson = {
         id: `lesson_builder_${Date.now()}`,
         blocks,
         createdAt: new Date().toISOString()
       }
       existing.push(newLesson)
       localStorage.setItem('custom_lessons', JSON.stringify(existing))
       alert("Lesson saved successfully!")
     } catch (e) {
       console.error("Save error", e)
       alert("Error saving lesson.")
     }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full p-4 w-full">
      {/* Left Pane: Editor */}
      <div className="w-full md:w-1/2 flex flex-col gap-6 overflow-y-auto pr-2">
        <JsonSchemaInspector blocks={blocks} setBlocks={setBlocks} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Lesson Outline</CardTitle>
            <Button size="sm" onClick={handleSaveLesson}><Save className="h-4 w-4 mr-2" /> Save</Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {blocks.map((block, index) => (
              <div
                key={block.blockId}
                onClick={() => setSelectedBlockId(block.blockId)}
                className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${selectedBlockId === block.blockId ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={(e) => handleMoveUp(index, e)}>
                       <span className="text-xs">▲</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={(e) => handleMoveDown(index, e)}>
                       <span className="text-xs">▼</span>
                    </Button>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{block.type}</div>
                    <div className="text-xs text-muted-foreground">{block.blockId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" onClick={(e) => handleDuplicate(block, index, e)}>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                   </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleDeleteBlock(block.blockId, e)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleAddBlock('heading_intro')}><Plus className="h-4 w-4 mr-1"/> Heading</Button>
              <Button variant="outline" size="sm" onClick={() => handleAddBlock('callout')}><Plus className="h-4 w-4 mr-1"/> Callout</Button>
              <Button variant="outline" size="sm" onClick={() => handleAddBlock('motion_canvas')}><Plus className="h-4 w-4 mr-1"/> Motion</Button>
              <Button variant="outline" size="sm" onClick={() => handleAddBlock('interactive_checkpoint')}><Plus className="h-4 w-4 mr-1"/> Checkpoint</Button>
              <Button variant="outline" size="sm" onClick={() => handleAddBlock('toggle_table')}><Plus className="h-4 w-4 mr-1"/> Table</Button>
            </div>
          </CardContent>
        </Card>

        {selectedBlockId && (
          <BlockEditorForm
            block={blocks.find(b => b.blockId === selectedBlockId)!}
            onChange={handleBlockChange}
          />
        )}
      </div>

      {/* Right Pane: Live Preview */}
      <div className="w-full md:w-1/2 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
        <div className="p-4 border-b bg-muted/50 flex justify-between items-center shrink-0">
          <h2 className="font-semibold">Live Preview</h2>
          <Button variant="secondary" size="sm" onClick={() => initializeLesson('lesson_builder_preview', blocks)}>
            Reset State
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
           <SmartLessonRenderer lesson={blocks} />
        </div>
      </div>
    </div>
  )
}
