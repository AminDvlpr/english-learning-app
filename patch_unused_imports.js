const fs = require('fs');

// SmartLessonRenderer
let renderer = fs.readFileSync('src/components/canvas/SmartLessonRenderer.tsx', 'utf-8');
renderer = renderer.replace(
  /import { Button } from "@\/components\/ui\/button"\nimport { ChevronLeft, ChevronRight } from "lucide-react"\n/,
  ``
).replace(
  /}, \[currentSlideIndex, currentBlock, currentBlock\?\.blockId, currentState, completeContentBlock\]\)/,
  `}, [currentSlideIndex, currentBlock, currentBlock?.blockId, currentState, completeContentBlock, isReadingPaused])`
);
fs.writeFileSync('src/components/canvas/SmartLessonRenderer.tsx', renderer);

// MotionCanvasBlock
let motion = fs.readFileSync('src/components/canvas/blocks/MotionCanvasBlock.tsx', 'utf-8');
motion = motion.replace(
  /import { Play, Pause, Minimize2, Maximize2 } from "lucide-react"\nimport { Button } from "@\/components\/ui\/button"\nimport { Badge } from "@\/components\/ui\/badge"\n/,
  ``
).replace(
  /const \[isPip, setIsPip\] = useState\(false\)\n/,
  ``
).replace(
  /const FIRST_CHECKPOINT = 4\.0\n/,
  ``
);
fs.writeFileSync('src/components/canvas/blocks/MotionCanvasBlock.tsx', motion);

// InteractiveCheckpointBlock
let checkpoint = fs.readFileSync('src/components/checkpoints/InteractiveCheckpointBlock.tsx', 'utf-8');
checkpoint = checkpoint.replace(
  /import { Badge } from "@\/components\/ui\/badge"\n/,
  ``
);
fs.writeFileSync('src/components/checkpoints/InteractiveCheckpointBlock.tsx', checkpoint);

console.log('Done');
