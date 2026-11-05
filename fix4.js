const fs = require('fs');
let page = fs.readFileSync('src/app/page.tsx', 'utf8');

page = page.replace(
  '// Logic to jump to a specific lesson in the feed could be added here\n                    // For now, just switch back to feed view. The VerticalLessonFeed naturally \n                    // syncs to current progress.\n                    setViewMode(\'feed\')',
  'setViewMode(\'feed\');\n                    setTimeout(() => {\n                        const el = document.getElementById(`lesson-container-${lessonId}`);\n                        if (el) el.scrollIntoView({ behavior: "smooth" });\n                    }, 100);'
);

page = page.replace(
  'const blockStates = useLearnerStore(state => state.blockStates)',
  ''
);

fs.writeFileSync('src/app/page.tsx', page);
