import { CourseDocument } from '@/types/course';
import aminSaraJourney from './amin-sara-journey.json';
import realWorldListening from './real-world-listening.json';

export const INITIAL_COURSES: CourseDocument[] = [
  aminSaraJourney as CourseDocument,
  realWorldListening as CourseDocument,

  {
    id: "movie-idioms",
    slug: "movie-idioms",
    titleFa: "اصطلاحات فیلم و سریال",
    titleEn: "Movie Idioms",
    descriptionFa: "یادگیری اصطلاحات",
    levelRange: "B1-B2",
    coverEmoji: "🎬",
    coverGradient: "from-blue-400 to-purple-500",
    isDefaultEnrolled: false,
    lessons: []
  } as CourseDocument,
];
