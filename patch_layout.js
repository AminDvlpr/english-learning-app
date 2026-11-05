const fs = require('fs');

// LessonTopBar
let topbar = fs.readFileSync('src/components/layout/LessonTopBar.tsx', 'utf-8');
topbar = topbar.replace(
  /className="container flex h-16 items-center justify-between max-w-4xl mx-auto px-4 md:px-8"/,
  `className="container flex h-14 md:h-16 items-center justify-between max-w-4xl mx-auto px-2 md:px-4"`
).replace(
  /className="text-sm md:text-base font-semibold truncate hidden md:block"/,
  `className="text-sm md:text-base font-semibold truncate hidden md:block max-w-[150px]"`
);
fs.writeFileSync('src/components/layout/LessonTopBar.tsx', topbar);

// VerticalLessonFeed
let feed = fs.readFileSync('src/components/canvas/VerticalLessonFeed.tsx', 'utf-8');
feed = feed.replace(
  /className="h-\[calc\(100vh-64px\)\] w-full overflow-y-auto snap-y snap-mandatory bg-background relative hide-scrollbar"/,
  `className="h-[calc(100dvh-3.5rem)] w-full overflow-y-auto snap-y snap-mandatory bg-background relative hide-scrollbar"`
).replace(
  /className="snap-start min-h-\[calc\(100vh-64px\)\] w-full max-w-5xl mx-auto flex flex-col relative pb-32"/,
  `className="snap-start min-h-[calc(100dvh-3.5rem)] w-full flex flex-col relative"`
).replace(
  /className="flex-1 w-full relative"/,
  `className="flex-1 w-full relative flex items-center justify-center bg-stone-950"`
).replace(
  /<SmartLessonRenderer lesson={lesson\.blocks} \/>/,
  `<div className="w-full h-full max-w-[420px] mx-auto bg-stone-950">
                <SmartLessonRenderer lesson={lesson.blocks} />
              </div>`
).replace(
  /className="absolute bottom-12 left-0 right-0 flex justify-center z-50 pointer-events-none px-4"/g,
  `className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-4"`
);
fs.writeFileSync('src/components/canvas/VerticalLessonFeed.tsx', feed);

console.log('Done');
