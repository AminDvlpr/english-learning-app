/* eslint-disable */
import * as React from "react"
import { CourseSlide, StorySlideFormat, DeepDiveAnnotation, SlideInterrupt,  } from "@/types/course"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Crosshair } from "lucide-react"

interface BlockEditorFormProps {
  slide: CourseSlide
  onChange: (slide: CourseSlide) => void
}

export function BlockEditorForm({ slide, onChange }: BlockEditorFormProps) {

  const handleTextChange = (field: keyof CourseSlide, value: string) => {
    onChange({ ...slide, [field]: value })
  }

  const updateNotionHeader = (field: string, value: string) => {
    const nh = slide.notionHeader || {
      coverGradient: 'linear-gradient(to right, #4ade80, #3b82f6)',
      iconEmoji: '📚',
      quoteBarText: '',
      metadata: { language: 'English', level: 'A1', chapter: '1', characters: '' }
    }
    onChange({ ...slide, notionHeader: { ...nh, [field]: value } })
  }

  const updateNotionHeaderMetadata = (field: string, value: string) => {
    const nh = slide.notionHeader || {
      coverGradient: 'linear-gradient(to right, #4ade80, #3b82f6)',
      iconEmoji: '📚',
      quoteBarText: '',
      metadata: { language: 'English', level: 'A1', chapter: '1', characters: '' }
    }
    onChange({ ...slide, notionHeader: { ...nh, metadata: { ...nh.metadata, [field]: value } } })
  }

  // --- Deep Dives ---
  const handleAddDeepDive = () => {
    const newDD: DeepDiveAnnotation = {
      id: `dd_${Date.now()}`,
      triggerText: '',
      title: '',
      category: 'grammar',
      explanationFa: '',
      examples: []
    }
    onChange({ ...slide, deepDives: [...(slide.deepDives || []), newDD] })
  }
  const updateDeepDive = (index: number, partial: Partial<DeepDiveAnnotation>) => {
    const arr = [...(slide.deepDives || [])]
    arr[index] = { ...arr[index], ...partial }
    onChange({ ...slide, deepDives: arr })
  }
  const removeDeepDive = (index: number) => {
    const arr = [...(slide.deepDives || [])]
    arr.splice(index, 1)
    onChange({ ...slide, deepDives: arr })
  }

  // --- Read Template ---
  const handleAddKineticParagraph = () => {
    const kp = slide.kineticParagraphs || []
    onChange({
      ...slide,
      kineticParagraphs: [...kp, { id: `kp_${Date.now()}`, textEn: '', highlightWords: [], translationFa: '' }]
    })
  }

  // --- Play Template ---
  const handleAddObject = () => {
    const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
    onChange({
      ...slide,
      playScene: {
        ...ps,
        objects: [...ps.objects, { id: `obj_${Date.now()}`, label: 'New Object', emoji: '📦', xPercent: 50, yPercent: 50 }]
      }
    })
  }

  // --- Interrupts ---
  const handleAddInterrupt = () => {
    const ints = slide.interrupts || []
    onChange({
      ...slide,
      interrupts: [...ints, { id: `int_${Date.now()}`, triggerAtPercentOrSec: 0, actionType: 'select', promptFa: '' }]
    })
  }
  const updateInterrupt = (index: number, partial: Partial<SlideInterrupt>) => {
    const arr = [...(slide.interrupts || [])]
    arr[index] = { ...arr[index], ...partial }
    onChange({ ...slide, interrupts: arr })
  }
  const removeInterrupt = (index: number) => {
    const arr = [...(slide.interrupts || [])]
    arr.splice(index, 1)
    onChange({ ...slide, interrupts: arr })
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
          <span>Edit Slide Properties</span>
          <select
            className="text-sm font-mono bg-muted px-2 py-1 rounded border"
            value={slide.format}
            onChange={(e) => handleTextChange('format', e.target.value as StorySlideFormat)}
          >
            <option value="read">Read</option>
            <option value="watch">Watch</option>
            <option value="listen">Listen</option>
            <option value="play">Play</option>
          </select>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Basic Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Slide ID</Label>
            <Input value={slide.id} onChange={(e) => handleTextChange('id', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={slide.title} onChange={(e) => handleTextChange('title', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Chapter Badge</Label>
            <Input value={slide.chapterBadge} onChange={(e) => handleTextChange('chapterBadge', e.target.value)} />
          </div>
        </div>

        {/* Format Specific Sections */}
        {slide.format === 'read' && (
          <div className="p-4 border rounded-md space-y-4 bg-muted/20">
            <h3 className="font-semibold">Notion Header Configuration</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Cover Gradient (CSS)</Label>
                <Input value={slide.notionHeader?.coverGradient || ''} onChange={(e) => updateNotionHeader('coverGradient', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Icon Emoji</Label>
                <Input value={slide.notionHeader?.iconEmoji || ''} onChange={(e) => updateNotionHeader('iconEmoji', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Quote Bar Text</Label>
              <Input value={slide.notionHeader?.quoteBarText || ''} onChange={(e) => updateNotionHeader('quoteBarText', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Meta: Language</Label>
                <Input value={slide.notionHeader?.metadata?.language || ''} onChange={(e) => updateNotionHeaderMetadata('language', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Meta: Level</Label>
                <Input value={slide.notionHeader?.metadata?.level || ''} onChange={(e) => updateNotionHeaderMetadata('level', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Meta: Chapter</Label>
                <Input value={slide.notionHeader?.metadata?.chapter || ''} onChange={(e) => updateNotionHeaderMetadata('chapter', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Meta: Characters</Label>
                <Input value={slide.notionHeader?.metadata?.characters || ''} onChange={(e) => updateNotionHeaderMetadata('characters', e.target.value)} />
              </div>
            </div>

            <h3 className="font-semibold mt-4">Kinetic Paragraphs</h3>
            {slide.kineticParagraphs?.map((kp, i) => (
              <div key={kp.id} className="p-2 border rounded space-y-2 bg-background">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono">{kp.id}</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const arr = [...(slide.kineticParagraphs || [])]
                    arr.splice(i, 1)
                    onChange({ ...slide, kineticParagraphs: arr })
                  }}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                </div>
                <div className="space-y-1">
                  <Label>Text (En)</Label>
                  <textarea className="w-full p-2 border rounded text-sm" rows={2} value={kp.textEn} onChange={(e) => {
                    const arr = [...(slide.kineticParagraphs || [])]
                    arr[i].textEn = e.target.value
                    onChange({ ...slide, kineticParagraphs: arr })
                  }}/>
                </div>
                <div className="space-y-1">
                  <Label>Translation (Fa)</Label>
                  <textarea className="w-full p-2 border rounded text-sm" rows={2} value={kp.translationFa} onChange={(e) => {
                    const arr = [...(slide.kineticParagraphs || [])]
                    arr[i].translationFa = e.target.value
                    onChange({ ...slide, kineticParagraphs: arr })
                  }}/>
                </div>
                {/* Simplified Highlight words for demo */}
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={handleAddKineticParagraph}><Plus className="h-4 w-4 mr-2"/> Add Paragraph</Button>
          </div>
        )}

        {slide.format === 'play' && (
          <div className="p-4 border rounded-md space-y-4 bg-muted/20">
            <h3 className="font-semibold">Play Scene Editor</h3>
            <div className="space-y-1">
              <Label>Background Theme</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={slide.playScene?.backgroundTheme || 'childhood_class'}
                onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, backgroundTheme: e.target.value as "childhood_class" | "uncle_living_room" | "london_apartment" | "cafe_counter" } })
                }}
              >
                <option value="childhood_class">Childhood Class</option>
                <option value="uncle_living_room">Uncle Living Room</option>
                <option value="london_apartment">London Apartment</option>
                <option value="cafe_counter">Cafe Counter</option>
              </select>
            </div>

            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm">2.5D Parallax Layers (PNG URLs)</h4>
              <div className="space-y-1">
                <Label>Background Layer (0.1x)</Label>
                <Input value={(slide.playScene as any)?.bgLayerUrl || ''} onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, bgLayerUrl: e.target.value } as any })
                }} />
              </div>
              <div className="space-y-1">
                <Label>Midground Layer (1.0x)</Label>
                <Input value={(slide.playScene as any)?.midLayerUrl || ''} onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, midLayerUrl: e.target.value } as any })
                }} />
              </div>
              <div className="space-y-1">
                <Label>Foreground Layer (1.2x)</Label>
                <Input value={(slide.playScene as any)?.fgLayerUrl || ''} onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, fgLayerUrl: e.target.value } as any })
                }} />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm">Uncle's Approval Meter</h4>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="approvalMeterToggle" checked={(slide.playScene as any)?.hasApprovalMeter || false} onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, hasApprovalMeter: e.target.checked } as any })
                }} />
                <Label htmlFor="approvalMeterToggle">Enable Approval Meter</Label>
              </div>
              <div className="space-y-1">
                <Label>Approval Delta (+20 / -15)</Label>
                <Input type="number" value={(slide.playScene as any)?.approvalDelta || 0} onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, approvalDelta: Number(e.target.value) } as any })
                }} />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-sm">Character Puppets (Living PNG Layers)</h4>
              <div className="space-y-1">
                <Label>Body URL</Label>
                <Input value={(slide.playScene as any)?.bodyUrl || ''} onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, bodyUrl: e.target.value } as any })
                }} />
              </div>
              <div className="space-y-1">
                <Label>Head URL</Label>
                <Input value={(slide.playScene as any)?.headUrl || ''} onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, headUrl: e.target.value } as any })
                }} />
              </div>
              <div className="space-y-1">
                <Label>Mouth Open URL</Label>
                <Input value={(slide.playScene as any)?.mouthOpenUrl || ''} onChange={(e) => {
                  const ps = slide.playScene || { backgroundTheme: 'childhood_class', characters: [], objects: [] }
                  onChange({ ...slide, playScene: { ...ps, mouthOpenUrl: e.target.value } as any })
                }} />
              </div>
            </div>

            <h4 className="font-semibold text-sm border-t pt-4 mt-4">Objects & Investigation Hotspots (◎)</h4>
            <div className="grid grid-cols-1 gap-2">
              {slide.playScene?.objects?.map((obj, i) => (
                <div key={obj.id} className="flex items-center gap-2 border p-2 rounded bg-background">
                  <Input className="w-12" placeholder="Emoji" value={obj.emoji} onChange={(e) => {
                    const arr = [...(slide.playScene?.objects || [])]
                    arr[i].emoji = e.target.value
                    onChange({ ...slide, playScene: { ...slide.playScene!, objects: arr } })
                  }}/>
                  <Input placeholder="Label" value={obj.label} onChange={(e) => {
                    const arr = [...(slide.playScene?.objects || [])]
                    arr[i].label = e.target.value
                    onChange({ ...slide, playScene: { ...slide.playScene!, objects: arr } })
                  }}/>
                  <Input className="w-20" type="number" placeholder="X%" value={obj.xPercent} onChange={(e) => {
                    const arr = [...(slide.playScene?.objects || [])]
                    arr[i].xPercent = Number(e.target.value)
                    onChange({ ...slide, playScene: { ...slide.playScene!, objects: arr } })
                  }}/>
                  <Input className="w-20" type="number" placeholder="Y%" value={obj.yPercent} onChange={(e) => {
                    const arr = [...(slide.playScene?.objects || [])]
                    arr[i].yPercent = Number(e.target.value)
                    onChange({ ...slide, playScene: { ...slide.playScene!, objects: arr } })
                  }}/>
                  <Button variant="ghost" size="icon" onClick={() => {
                    const arr = [...(slide.playScene?.objects || [])]
                    arr.splice(i, 1)
                    onChange({ ...slide, playScene: { ...slide.playScene!, objects: arr } })
                  }}><Trash2 className="h-4 w-4 text-destructive"/></Button>

                  <div className="w-full flex flex-col gap-2 p-2 bg-muted/50 rounded mt-1">
                    <Input placeholder="👁️ Look Monologue (En)" value={(obj as any).lookMonologueEn || ''} onChange={(e) => {
                      const arr = [...(slide.playScene?.objects || [])];
                      (arr[i] as any).lookMonologueEn = e.target.value;
                      onChange({ ...slide, playScene: { ...slide.playScene!, objects: arr } })
                    }}/>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={(obj as any).canGrabToInventory || false} onChange={(e) => {
                        const arr = [...(slide.playScene?.objects || [])];
                        (arr[i] as any).canGrabToInventory = e.target.checked;
                        onChange({ ...slide, playScene: { ...slide.playScene!, objects: arr } })
                      }}/>
                      <Label className="text-xs">✋ Grab to Inventory</Label>
                    </div>
                    <Input placeholder="Required Item ID (for drag-and-drop)" value={(obj as any).requiredItemId || ''} onChange={(e) => {
                      const arr = [...(slide.playScene?.objects || [])];
                      (arr[i] as any).requiredItemId = e.target.value;
                      onChange({ ...slide, playScene: { ...slide.playScene!, objects: arr } })
                    }}/>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-fit" onClick={handleAddObject}><Crosshair className="h-4 w-4 mr-2"/> Add Object Hotspot</Button>
            </div>

            <h4 className="font-semibold text-sm">Characters</h4>
            <div className="text-xs text-muted-foreground">Character editor omitted for brevity...</div>
          </div>
        )}

        {(slide.format === 'listen' || slide.format === 'watch') && (
          <div className="p-4 border rounded-md space-y-4 bg-muted/20">
            <h3 className="font-semibold">{slide.format === 'listen' ? 'Audio' : 'Video'} Configuration</h3>
            <div className="space-y-1">
              <Label>Media Duration (Sec)</Label>
              <Input type="number" value={slide.videoDurationSec || 0} onChange={(e) => onChange({ ...slide, videoDurationSec: Number(e.target.value) })} />
            </div>
            {slide.format === 'listen' && (
              <div className="space-y-2">
                <Label>Audio Script</Label>
                <Button size="sm" variant="outline" className="w-fit" onClick={() => {
                  const arr = slide.audioScript || []
                  onChange({ ...slide, audioScript: [...arr, { speaker: 'Amin', textEn: '', textFa: '', durationSec: 2 }] })
                }}><Plus className="h-4 w-4 mr-2"/> Add Script Line</Button>
                {slide.audioScript?.map((s, i) => (
                  <div key={i} className="flex gap-2 p-2 border rounded bg-background">
                    <Input className="w-24" placeholder="Speaker" value={s.speaker} onChange={(e) => {
                      const arr = [...(slide.audioScript || [])]
                      arr[i].speaker = e.target.value
                      onChange({ ...slide, audioScript: arr })
                    }}/>
                    <Input className="flex-1" placeholder="Text (En)" value={s.textEn} onChange={(e) => {
                      const arr = [...(slide.audioScript || [])]
                      arr[i].textEn = e.target.value
                      onChange({ ...slide, audioScript: arr })
                    }}/>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const arr = [...(slide.audioScript || [])]
                      arr.splice(i, 1)
                      onChange({ ...slide, audioScript: arr })
                    }}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 border rounded-md space-y-4">
          <h3 className="font-semibold">Story Node-Graph & Visa Document Inspection</h3>

          <div className="space-y-1">
            <Label>Story Nodes Graph (JSON Array)</Label>
            <textarea className="w-full p-2 border rounded font-mono text-xs" rows={3}
              value={JSON.stringify((slide as any).storyNodes || [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange({ ...slide, storyNodes: parsed } as any)
                } catch(err) {}
              }}
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">Visa Document Fields</h4>
              <Button size="sm" variant="outline" onClick={() => {
                const arr = (slide as any).documentFields || [];
                onChange({ ...slide, documentFields: [...arr, { id: `doc_${Date.now()}`, fieldLabel: '', wrongValue: '', correctValue: '' }] } as any)
              }}><Plus className="h-4 w-4 mr-2"/> Add Field</Button>
            </div>

            {((slide as any).documentFields || []).map((docField: any, i: number) => (
              <div key={docField.id} className="grid grid-cols-3 gap-2 p-2 border rounded bg-background relative pr-8">
                <Input placeholder="Field Label (e.g. Nationality)" value={docField.fieldLabel} onChange={(e) => {
                  const arr = [...((slide as any).documentFields || [])];
                  arr[i].fieldLabel = e.target.value;
                  onChange({ ...slide, documentFields: arr } as any)
                }}/>
                <Input placeholder="Wrong Value (e.g. Iranian)" value={docField.wrongValue} onChange={(e) => {
                  const arr = [...((slide as any).documentFields || [])];
                  arr[i].wrongValue = e.target.value;
                  onChange({ ...slide, documentFields: arr } as any)
                }}/>
                <Input placeholder="Correct Value (e.g. British)" value={docField.correctValue} onChange={(e) => {
                  const arr = [...((slide as any).documentFields || [])];
                  arr[i].correctValue = e.target.value;
                  onChange({ ...slide, documentFields: arr } as any)
                }}/>
                <Button variant="ghost" size="icon" className="absolute right-1 top-1" onClick={() => {
                  const arr = [...((slide as any).documentFields || [])];
                  arr.splice(i, 1);
                  onChange({ ...slide, documentFields: arr } as any)
                }}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
            ))}
          </div>
        </div>

        {/* Universal Interrupts */}
        <div className="p-4 border rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Universal Interrupts</h3>
            <Button size="sm" variant="outline" onClick={handleAddInterrupt}><Plus className="h-4 w-4 mr-2"/> Add Interrupt</Button>
          </div>
          {slide.interrupts?.map((int, i) => (
            <div key={int.id} className="p-3 border rounded bg-muted/10 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs font-mono">{int.id}</span>
                <Button variant="ghost" size="sm" onClick={() => removeInterrupt(i)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Trigger (Percent or Sec or WordIndex)</Label>
                  <Input type="number" value={int.triggerAtPercentOrSec} onChange={(e) => updateInterrupt(i, { triggerAtPercentOrSec: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>Action Type</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={int.actionType}
                    onChange={(e) => updateInterrupt(i, { actionType: e.target.value as "select" | "drag_and_drop" | "walk_away" | "slot_fill" | "voice_reply" })}
                  >
                    <option value="select">Select (Multiple Choice)</option>
                    <option value="drag_and_drop">Drag & Drop (Play)</option>
                    <option value="walk_away">Walk Away (Play)</option>
                    <option value="slot_fill">Slot Fill</option>
                    <option value="voice_reply">Voice Reply</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Prompt (Fa)</Label>
                <Input value={int.promptFa} onChange={(e) => updateInterrupt(i, { promptFa: e.target.value })} />
              </div>

              {int.actionType === 'drag_and_drop' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Source Object ID</Label>
                    <Input value={int.sourceObjectId || ''} onChange={(e) => updateInterrupt(i, { sourceObjectId: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Target Object ID</Label>
                    <Input value={int.targetObjectId || ''} onChange={(e) => updateInterrupt(i, { targetObjectId: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Universal Deep Dives */}
        <div className="p-4 border rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Inline Deep Dives</h3>
            <Button size="sm" variant="outline" onClick={handleAddDeepDive}><Plus className="h-4 w-4 mr-2"/> Add Deep Dive</Button>
          </div>
          {slide.deepDives?.map((dd, i) => (
            <div key={dd.id} className="p-3 border rounded bg-muted/10 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs font-mono">{dd.id}</span>
                <Button variant="ghost" size="sm" onClick={() => removeDeepDive(i)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Trigger Text</Label>
                  <Input value={dd.triggerText} onChange={(e) => updateDeepDive(i, { triggerText: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={dd.category}
                    onChange={(e) => updateDeepDive(i, { category: e.target.value as "grammar" | "etymology" | "cultural" | "pronunciation" })}
                  >
                    <option value="grammar">Grammar</option>
                    <option value="cultural">Cultural</option>
                    <option value="etymology">Etymology</option>
                    <option value="pronunciation">Pronunciation</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={dd.title} onChange={(e) => updateDeepDive(i, { title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Explanation (Fa)</Label>
                <textarea className="w-full p-2 border rounded text-sm" rows={2} value={dd.explanationFa} onChange={(e) => updateDeepDive(i, { explanationFa: e.target.value })}/>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  )
}
