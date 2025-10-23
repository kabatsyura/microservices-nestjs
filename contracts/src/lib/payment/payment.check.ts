import { IsString } from 'class-validator';

export type PaymentCheck = 'canceled' | 'success' | 'progress';
/* eslint-disable @typescript-eslint/no-namespace */
export namespace PaymentCheck {
  export const topic = 'payment.check.query';

  export class Request {
    @IsString()
    courseId!: string;

    @IsString()
    userId!: string;
  }

  export class Response {
    status!: PaymentCheck;
  }
}
