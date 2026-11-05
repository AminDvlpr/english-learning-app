const fs = require('fs');
let file = fs.readFileSync('src/components/builder/BlockEditorForm.tsx', 'utf8');
file = file.replace(/as NonNullable<Parameters<typeof onChange>\[0\]\["playScene"\]>\["backgroundTheme"\]/g, 'as any');
fs.writeFileSync('src/components/builder/BlockEditorForm.tsx', file);
