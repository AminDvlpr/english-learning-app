import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CourseDocument } from '@/types/course';
import { INITIAL_COURSES } from '@/data/courses';

const COURSES_DIR = path.join(process.cwd(), 'src', 'data', 'courses');

export async function GET() {
  try {
    const files = await fs.readdir(COURSES_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      return NextResponse.json({ courses: INITIAL_COURSES });
    }

    const courses: CourseDocument[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(COURSES_DIR, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const course = JSON.parse(fileContent) as CourseDocument;
      courses.push(course);
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Failed to read courses from filesystem, falling back to INITIAL_COURSES:', error);
    return NextResponse.json({ courses: INITIAL_COURSES });
  }
}

export async function POST(request: Request) {
  try {
    const course: CourseDocument = await request.json();

    if (!course || !course.id) {
      return NextResponse.json({ error: 'Invalid course payload' }, { status: 400 });
    }

    const filePath = path.join(COURSES_DIR, `${course.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(course, null, 2), 'utf-8');

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Failed to write course to filesystem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
