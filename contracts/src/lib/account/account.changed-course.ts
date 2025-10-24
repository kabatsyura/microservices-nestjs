/* eslint-disable @typescript-eslint/no-namespace */
import { IsString } from 'class-validator';
import { PurchaseState } from 'interfaces/src/lib/user.interface';

export namespace AccountChangedCourse {
  export const topic = 'account.changed-course.event';

  export class Request {
    @IsString()
    userId!: string;

    @IsString()
    courseId!: string;

    @IsString()
    status!: PurchaseState;
  }

  // events не имеет ответа Response
}
