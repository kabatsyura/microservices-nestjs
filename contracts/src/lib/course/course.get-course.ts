import { ICourse } from '@purple/interfaces';
import { IsString } from 'class-validator';

/* eslint-disable @typescript-eslint/no-namespace */
export namespace CourseGetCourse {
  export const topic = 'course.get-course.query';

  export class Request {
    @IsString()
    id!: string;
  }

  export class Response {
    course!: ICourse | null;
  }
}
