/* eslint-disable @typescript-eslint/no-namespace */
import { IsString } from 'class-validator';
import { IUserCourses } from 'interfaces/src/lib/user.interface';

export namespace AccountUserCourses {
  export const topic = 'account.user-courses.query';

  export class Request {
    @IsString()
    id!: string;
  }

  export class Response {
    courses!: IUserCourses[];
  }
}
