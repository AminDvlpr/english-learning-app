const fs = require('fs');

let page = fs.readFileSync('src/app/page.tsx', 'utf8');

page = page.replace(
  'setViewMode(\'feed\')',
  '// Ensure the element has time to render after view mode switch\n                    setViewMode(\'feed\');\n                    setTimeout(() => {\n                        const el = document.getElementById(`lesson-container-${lessonId}`);\n                        if (el) el.scrollIntoView({ behavior: "smooth" });\n                    }, 100);'
);

fs.writeFileSync('src/app/page.tsx', page);

let feed = fs.readFileSync('src/components/canvas/VerticalLessonFeed.tsx', 'utf8');

feed = feed.replace(
  'className="snap-start min-h-[calc(100vh-64px)]',
  'id={`lesson-container-${lesson.id}`}\n            className="snap-start min-h-[calc(100vh-64px)]'
);

fs.writeFileSync('src/components/canvas/VerticalLessonFeed.tsx', feed);
