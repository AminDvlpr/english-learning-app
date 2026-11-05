const fs = require('fs');
let content = fs.readFileSync('src/components/canvas/blocks/MotionCanvasBlock.tsx', 'utf-8');

// Fix closing tags issue
content = content.replace(
  /<\/div>\n      <\/motion\.div>\n    <\/AnimatePresence>\n  \)\n}/,
  `      </motion.div>\n    </AnimatePresence>\n  )\n}`
).replace(
  /}, \[isPlaying, state, block\.blockId, completeContentBlock\]\)/,
  `}, [localIsPlaying, state, block.blockId, completeContentBlock, nextCheckpoint, activeCheckpointState])`
);

fs.writeFileSync('src/components/canvas/blocks/MotionCanvasBlock.tsx', content);
console.log('Done');
