const fs = require('fs');
const path = 'src/components/motion/CafeInteractiveVectorScene.tsx';
let content = fs.readFileSync(path, 'utf-8');

// Replace aspect-video with w-full h-full object-cover style filling
content = content.replace(
  /className="relative w-full aspect-video bg-amber-50 dark:bg-amber-950\/20 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4"/,
  `className="relative w-full h-full flex-1 bg-amber-50 dark:bg-amber-950/20 overflow-hidden shadow-inner flex items-center justify-center p-4 object-cover"`
);

// Remove the checkpoint popup
content = content.replace(
  /{\s*state === 'checkpoint_paused' && \([\s\S]*?<\/motion\.div>\n        \)}/,
  ``
);

fs.writeFileSync(path, content);
console.log('Done');
