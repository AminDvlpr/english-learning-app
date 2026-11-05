const fs = require('fs');
let content = fs.readFileSync('src/components/canvas/blocks/MotionCanvasBlock.tsx', 'utf-8');
content = content.replace(
  /import { MotionCanvasBlock as MotionCanvasBlockType } from "@\/types"/,
  `import { MotionCanvasBlock as MotionCanvasBlockType, InteractiveCheckpointBlock as InteractiveCheckpointBlockType } from "@/types"\nimport { InteractiveCheckpointBlock } from "@/components/checkpoints/InteractiveCheckpointBlock"`
).replace(
  /interface MotionCanvasBlockProps {/,
  `interface MotionCanvasBlockProps {
  checkpoints?: InteractiveCheckpointBlockType[]
  onProgress?: (percent: number) => void`
).replace(
  /export function MotionCanvasBlock\(\{ block, state, isPlaying, onPlayPause \}: MotionCanvasBlockProps\) {/,
  `export function MotionCanvasBlock({ block, state, checkpoints = [], onProgress }: MotionCanvasBlockProps) {`
).replace(
  /const \[isPip, setIsPip\] = useState\(false\)/,
  `const [isPip, setIsPip] = useState(false)
  const [localIsPlaying, setLocalIsPlaying] = useState(true)`
).replace(
  /React\.useEffect\(\(\) => {/,
  `// Sync with checkpoints
  const blockStates = useLearnerStore(state => state.blockStates)
  const [solvedCheckpointIds, setSolvedCheckpointIds] = useState<Set<string>>(new Set())

  // Find next unsolved checkpoint
  const nextCheckpoint = checkpoints.find(cp => !solvedCheckpointIds.has(cp.blockId))

  const activeCheckpointState = nextCheckpoint ? blockStates[nextCheckpoint.blockId]?.state : null

  // Auto-resume logic
  React.useEffect(() => {
    if (activeCheckpointState === 'completed' && nextCheckpoint) {
        // Wait 1s then resume
        const timer = setTimeout(() => {
            setSolvedCheckpointIds(prev => new Set(prev).add(nextCheckpoint.blockId))
            setLocalIsPlaying(true)
        }, 1000)
        return () => clearTimeout(timer)
    }
  }, [activeCheckpointState, nextCheckpoint])

  React.useEffect(() => {`
).replace(
  /if \(\!isPlaying\) return/,
  `if (!localIsPlaying) return`
).replace(
  /const next = prev \+ 0\.1/,
  `let next = prev + 0.1`
).replace(
  /if \(next >= TOTAL_DURATION\) {/,
  `// Auto-pause at checkpoint
        if (nextCheckpoint && next >= nextCheckpoint.triggerTimestamp && activeCheckpointState !== 'completed') {
           next = nextCheckpoint.triggerTimestamp
           if (activeCheckpointState !== 'verification-required' && activeCheckpointState !== 'adaptive-remediation') {
              useLearnerStore.getState().blockStates[nextCheckpoint.blockId] = {
                  ...useLearnerStore.getState().blockStates[nextCheckpoint.blockId],
                  state: 'verification-required'
              }
              // Force state update
              useLearnerStore.setState({ blockStates: { ...useLearnerStore.getState().blockStates }})
           }
           setLocalIsPlaying(false)
           return next
        }

        if (next >= TOTAL_DURATION) {`
).replace(
  /\/\/ Auto-complete at first checkpoint timestamp \(4\.0s\)\n        if \(prev < FIRST_CHECKPOINT && next >= FIRST_CHECKPOINT && state === 'active'\) {\n          completeContentBlock\(block\.blockId\)\n        }/,
  `// Auto-complete at end of video if not already
        if (prev < TOTAL_DURATION && next >= TOTAL_DURATION && state === 'active') {
          completeContentBlock(block.blockId)
        }`
).replace(
  /const progressPercent = \(localTime \/ TOTAL_DURATION\) \* 100/,
  `const progressPercent = (localTime / TOTAL_DURATION) * 100
  React.useEffect(() => {
    if (onProgress) onProgress(progressPercent)
  }, [progressPercent, onProgress])`
).replace(
  /<motion\.div[\s\S]*?className={`flex flex-col gap-4 w-full \${isPip \? 'fixed bottom-4 right-4 w-96 shadow-2xl z-50 bg-background p-4 rounded-xl border' : 'relative'}`}/,
  `<motion.div
        variants={scalePopInVariant}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        className="w-full h-full flex-1 flex flex-col relative"
        onPointerDown={() => setLocalIsPlaying(false)}
        onPointerUp={() => !nextCheckpoint || localTime < nextCheckpoint.triggerTimestamp ? setLocalIsPlaying(true) : null}
        onPointerCancel={() => !nextCheckpoint || localTime < nextCheckpoint.triggerTimestamp ? setLocalIsPlaying(true) : null}
        onPointerLeave={() => !nextCheckpoint || localTime < nextCheckpoint.triggerTimestamp ? setLocalIsPlaying(true) : null}`
).replace(
  /{block\.caption && \!isPip && \([\s\S]*?<\/h2>\n        \)}/,
  ``
).replace(
  /<div className="relative group">/,
  `<div className="w-full h-full relative">`
).replace(
  /{\/\* PiP Toggle \*\/}[\s\S]*?<\/Button>/,
  ``
).replace(
  /{\/\* Controls \*\/}[\s\S]*?<\/div>\n      <\/motion\.div>/,
  `{/* Checkpoint Overlay */}
          {nextCheckpoint && localTime >= nextCheckpoint.triggerTimestamp && (
             <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent pt-12 pb-6 px-4 z-50">
               <InteractiveCheckpointBlock
                 block={nextCheckpoint}
                 state={activeCheckpointState || 'locked'}
               />
             </div>
          )}
        </div>
      </motion.div>`
);

fs.writeFileSync('src/components/canvas/blocks/MotionCanvasBlock.tsx', content);
console.log('Done');
