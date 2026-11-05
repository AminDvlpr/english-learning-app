const fs = require('fs');
let file = fs.readFileSync('src/components/builder/LessonBuilderStudio.tsx', 'utf8');
file = file.replace(
  /React\.useEffect\(\(\) => \{\n    if \(courses\.length > 0 && !activeCourseId\) \{\n      handleSelectCourse\(courses\[0\]\.id\)\n    \}\n  \}, \[courses, activeCourseId\]\)/,
  `React.useEffect(() => {
    if (courses.length > 0 && !activeCourseId) {
      handleSelectCourse(courses[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, activeCourseId])`
);
fs.writeFileSync('src/components/builder/LessonBuilderStudio.tsx', file);
