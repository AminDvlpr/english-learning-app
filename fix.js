const fs = require('fs');

let feed = fs.readFileSync('src/components/canvas/VerticalLessonFeed.tsx', 'utf8');

// The reviewer mentioned "Lesson Mastered!" is unreachable. We need to render the mastered lesson WITH the "Lesson Mastered!" prompt, and keep it in the DOM while it's mastered until they scroll down? Wait, actually if they master it, it unlocks the NEXT one. So visibleLessonsCount would increment, meaning this lesson is NO LONGER the `isLastVisible`.
// To show the message, maybe we show one MORE lesson if the last one is mastered? No, `visibleLessonsCount` stops at the FIRST unmastered lesson. So if a lesson is mastered, the loop keeps going, so `visibleLessonsCount` increases.
// But wait! If the user masters lesson 1, `visibleLessonsCount` becomes 2. Lesson 1 is no longer `isLastVisible`. So `isLastVisible` applies to Lesson 2, which is unmastered, so it shows "Locked". The user never sees "Lesson Mastered!".
// To show "Lesson Mastered!", we should maybe show it on ALL mastered lessons that have a next lesson, OR show it briefly?
// The requirements say: "Once mastered, show an animated "✨ Lesson Mastered! Scroll down for Next Lesson ↓" prompt and reveal the next lesson card below!"
// If the next lesson card is revealed below, the user can just scroll to it. We don't need a gate on the mastered lesson, but the prompt should probably appear at the bottom of the mastered lesson card? Yes, if we show it at the bottom of ALL mastered lessons except maybe not if they are already far past it. But for simplicity, we can show it at the bottom of a mastered lesson IF it's not the very last lesson in the entire feed.

// Let's change the gating logic:
// The prompt says: "While incomplete, show a sleek bottom gate pill... Once mastered, show an animated prompt and reveal the next lesson card below!"
// So every lesson card that has a next lesson should have a bottom indicator. If it's incomplete, it's locked. If it's complete, it shows unlocked.
// Wait, we can just remove `&& isLastVisible` from the condition for the "Lesson Mastered!" prompt, or rather, if it's unmastered, show Locked. If it's mastered and there's a next lesson, show "Lesson Mastered!".
// BUT we only want the prompt on the *most recently mastered* or all mastered ones?
// The user scrolls down. So if they are looking at Lesson 1 (mastered), they see "Lesson Mastered! Scroll down". They scroll down to Lesson 2.
// That makes perfect sense. Let's show the prompt at the bottom of ALL cards that are not the final card in the feed.

feed = feed.replace(
  '{/* Bottom Gate Indicator for the last visible lesson */}\n            {isLastVisible && hasMoreLessons && (',
  '{/* Bottom Gate Indicator */}\n            {hasMoreLessons && ('
);

fs.writeFileSync('src/components/canvas/VerticalLessonFeed.tsx', feed);
