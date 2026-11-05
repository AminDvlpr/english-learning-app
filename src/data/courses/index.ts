import { CourseDocument } from '@/types/course';
import aminSaraJourney from './amin-sara-journey.json';
import realWorldListening from './real-world-listening.json';

export const INITIAL_COURSES: CourseDocument[] = [
  aminSaraJourney as CourseDocument,
  realWorldListening as CourseDocument,
];
