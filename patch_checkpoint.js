const fs = require('fs');
let content = fs.readFileSync('src/components/checkpoints/InteractiveCheckpointBlock.tsx', 'utf-8');

// Remove Card components completely and use a minimal dark overlay style
content = content.replace(
  /import { Card, CardHeader, CardTitle, CardContent } from '@\/components\/ui\/card'/,
  ``
).replace(
  /<Card className={`[\s\S]*?`}>/,
  `<div className="w-full text-white pb-6 px-4 z-50">`
).replace(
  /<CardHeader className="bg-muted\/30 border-b">[\s\S]*?<\/CardTitle>\n        <\/CardHeader>/,
  `<div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {block.difficultyLevel && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full capitalize">
                  {block.difficultyLevel}
                </span>
              )}
              {block.xpReward && (
                <span className="text-xs bg-primary/40 text-white font-mono px-2 py-1 rounded-full">
                  +{block.xpReward} XP
                </span>
              )}
            </div>
          </div>
          <h3 className="text-xl font-bold mb-4 leading-relaxed drop-shadow-md" dir="rtl">
            {block.question.prompt}
          </h3>`
).replace(
  /<CardContent className="p-6 bg-background">/,
  `<div>`
).replace(
  /<\/CardContent>\n      <\/Card>/,
  `</div>\n      </div>`
).replace(
  /{\!isActiveChallenge && \!isCompleted \? \([\s\S]*?\) : isCompleted \? \(/,
  `{isCompleted ? (`
);

fs.writeFileSync('src/components/checkpoints/InteractiveCheckpointBlock.tsx', content);

// BranchingDecisionExercise
let branching = fs.readFileSync('src/components/checkpoints/BranchingDecisionExercise.tsx', 'utf-8');
branching = branching.replace(
  /variant="outline"\n\s*className="w-full justify-start font-mono h-auto py-4 px-6 text-left whitespace-normal text-base shadow-sm hover:shadow-md transition-shadow"/,
  `variant="ghost"\n            className="w-full justify-start font-mono h-auto py-4 px-6 text-left whitespace-normal text-base bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md rounded-2xl transition-all shadow-lg"`
);
fs.writeFileSync('src/components/checkpoints/BranchingDecisionExercise.tsx', branching);

// SlotMatchingExercise
let slot = fs.readFileSync('src/components/checkpoints/SlotMatchingExercise.tsx', 'utf-8');
slot = slot.replace(
  /className="flex flex-wrap gap-2 min-h-16 p-4 rounded-xl bg-muted\/50 border border-border"/,
  `className="flex flex-wrap gap-2 min-h-16 p-4 rounded-xl bg-black/40 border border-white/20 text-white"`
).replace(
  /bg-background border-2 border-dashed border-muted-foreground\/30/,
  `bg-white/10 border-2 border-dashed border-white/30`
).replace(
  /className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 font-mono cursor-pointer"/,
  `className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-white/30 bg-white/20 hover:bg-white/30 text-white h-10 px-4 py-2 font-mono cursor-pointer backdrop-blur-md"`
).replace(
  /<Button\n\s*onClick={handleSubmit}\n\s*disabled={\!isComplete}\n\s*className="w-full mt-4 transition-all"\n\s*size="lg"\n\s*>/,
  `<Button\n        onClick={handleSubmit}\n        disabled={!isComplete}\n        className="w-full mt-4 transition-all bg-white text-black hover:bg-gray-200"\n        size="lg"\n      >`
);
fs.writeFileSync('src/components/checkpoints/SlotMatchingExercise.tsx', slot);

// MicroSprintReflexExercise
let micro = fs.readFileSync('src/components/checkpoints/MicroSprintReflexExercise.tsx', 'utf-8');
micro = micro.replace(
  /className="h-2 w-full bg-muted rounded-full overflow-hidden mb-2"/,
  `className="h-2 w-full bg-white/50 rounded-full overflow-hidden mb-2"`
).replace(
  /className="h-full bg-primary"/,
  `className="h-full bg-white"`
).replace(
  /variant="outline"\n\s*className="w-full justify-start font-mono h-auto py-4 px-6 text-left whitespace-normal text-base shadow-sm"/,
  `variant="ghost"\n            className="w-full justify-start font-mono h-auto py-4 px-6 text-left whitespace-normal text-base bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md rounded-2xl transition-all shadow-lg"`
).replace(
  /<p className="text-muted-foreground text-center mb-2 font-medium" dir="rtl">/,
  `<p className="text-white text-center mb-2 font-medium drop-shadow-md" dir="rtl">`
);
fs.writeFileSync('src/components/checkpoints/MicroSprintReflexExercise.tsx', micro);

// StoryQuestionBoxExercise
let story = fs.readFileSync('src/components/checkpoints/StoryQuestionBoxExercise.tsx', 'utf-8');
story = story.replace(
  /className="w-full flex flex-col items-center gap-4 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-6 rounded-2xl shadow-lg relative"/,
  `className="bg-transparent w-full flex flex-col items-center gap-4 relative"`
).replace(
  /className="bg-gray-100 py-3 px-4 font-semibold text-gray-800 text-sm border-b"/,
  `className="bg-white py-3 px-4 font-semibold text-gray-800 text-sm border-b"`
);
fs.writeFileSync('src/components/checkpoints/StoryQuestionBoxExercise.tsx', story);

console.log('Done');
