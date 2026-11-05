const fs = require('fs');
const content = fs.readFileSync('src/components/canvas/SmartLessonRenderer.tsx', 'utf-8');
const newContent = content.replace(
  /const \[currentSlideIndex, setCurrentSlideIndex\] = useState\(0\)/,
  `const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)`
).replace(
  /const currentBlock = lesson\[currentSlideIndex\]/,
  `// Group slides so that checkpoints immediately following a motion_canvas are embedded inside it
  const storySlides: { main: LessonBlock, checkpoints: InteractiveCheckpointBlockType[] }[] = React.useMemo(() => {
    const slides: { main: LessonBlock, checkpoints: InteractiveCheckpointBlockType[] }[] = []
    for (let i = 0; i < lesson.length; i++) {
      const block = lesson[i]
      if (block.type === 'interactive_checkpoint' && slides.length > 0 && slides[slides.length - 1].main.type === 'motion_canvas') {
        slides[slides.length - 1].checkpoints.push(block as InteractiveCheckpointBlockType)
      } else {
        slides.push({ main: block, checkpoints: [] })
      }
    }
    return slides
  }, [lesson])

  const currentSlide = storySlides[currentSlideIndex]
  const currentBlock = currentSlide?.main`
).replace(
  /const currentState = currentBlock \? \(blockStates\[currentBlock\.blockId\]\?\.state \|\| 'locked'\) : 'locked'/,
  `const currentState = currentBlock ? (blockStates[currentBlock.blockId]?.state || 'locked') : 'locked'

  // Hold-to-pause logic for reading slides
  const [isReadingPaused, setIsReadingPaused] = useState(false)`
).replace(
  /if \(isReadingBlock && currentState === 'active'\) {/,
  `if (isReadingBlock && currentState === 'active' && !isReadingPaused) {`
).replace(
  /setReadProgress\(prev => {/,
  `setReadProgress(prev => {`
).replace(
  /goNext\(\)/,
  `goNext()`
).replace(
  /if \(currentState === 'completed' && currentSlideIndex < lesson.length - 1\)/,
  `if (currentState === 'completed' && currentSlideIndex < storySlides.length - 1)`
).replace(
  /className="flex flex-col w-full min-h-screen bg-stone-50 dark:bg-stone-950 relative sm:p-4 pb-24"/,
  `className="flex flex-col w-full min-h-[100dvh] bg-stone-50 dark:bg-stone-950 relative sm:p-4"`
).replace(
  /className="max-w-xl mx-auto w-full bg-white dark:bg-stone-900 sm:rounded-\[32px\] sm:shadow-2xl overflow-hidden min-h-\[100dvh\] sm:min-h-\[800px\] flex flex-col relative border-x sm:border border-stone-200 dark:border-stone-800"/,
  `className="w-full max-w-[420px] mx-auto bg-white dark:bg-stone-900 sm:rounded-[28px] overflow-hidden h-[100dvh] sm:h-[calc(100dvh-5rem)] sm:max-h-[820px] flex flex-col relative sm:shadow-2xl"`
).replace(
  /{lesson\.map\(\(b, idx\) => {/,
  `{storySlides.map((slide, idx) => {
            const b = slide.main`
).replace(
  /else if \(isCurrent && isReadingSlide\) fillPercent = \(readProgress \/ READING_TIME_MS\) \* 100/,
  `else if (isCurrent && isReadingSlide) fillPercent = (readProgress / READING_TIME_MS) * 100
            else if (isCurrent && b.type === 'motion_canvas') fillPercent = videoProgress`
).replace(
  /<div className="flex-1 overflow-y-auto px-6 pb-24 relative">/,
  `{/* Left/Right Tap Zones */}
        <div
          className="absolute inset-y-0 left-0 w-1/4 z-30 cursor-pointer"
          onClick={goPrev}
          onPointerDown={() => setIsReadingPaused(true)}
          onPointerUp={() => setIsReadingPaused(false)}
          onPointerCancel={() => setIsReadingPaused(false)}
          onPointerLeave={() => setIsReadingPaused(false)}
        />
        <div
          className="absolute inset-y-0 right-0 w-3/4 z-30 cursor-pointer"
          onClick={goNext}
          onPointerDown={() => setIsReadingPaused(true)}
          onPointerUp={() => setIsReadingPaused(false)}
          onPointerCancel={() => setIsReadingPaused(false)}
          onPointerLeave={() => setIsReadingPaused(false)}
        />

        {/* Slide Content */}
        <div className="flex-1 overflow-hidden relative">`
).replace(
  /<MotionCanvasBlock[\s\S]*?\/>/,
  `<MotionCanvasBlock
                    block={currentBlock as MotionCanvasBlockType}
                    state={currentState}
                    checkpoints={currentSlide.checkpoints}
                    onProgress={setVideoProgress}
                    currentTimeSec={0} // Managed internally now
                    isPlaying={true}
                    onPlayPause={() => {}}
                  />`
).replace(
  /className="py-4"/,
  `className="h-full w-full"`
).replace(
  /{\/\* Fixed Bottom Navigation \*\/}[\s\S]*?<\/div>/,
  `` // Remove the bottom nav completely
);

fs.writeFileSync('src/components/canvas/SmartLessonRenderer.tsx', newContent);
console.log('Done');
