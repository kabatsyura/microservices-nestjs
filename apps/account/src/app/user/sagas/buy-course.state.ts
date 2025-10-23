import { PaymentCheck } from '@purple/contracts';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseSaga } from './buy-course.saga';

export abstract class BuyCourseState {
  public saga: BuyCourseSaga;

  public setContext(saga: BuyCourseSaga) {
    this.saga = saga;
  }

  public abstract pay(): Promise<{
    paymentLink: string;
    user: UserEntity;
  }>;

  public abstract checkPayment(): Promise<{
    user: UserEntity;
    status: PaymentCheck;
  }>;

  public abstract canceled(): Promise<{ user: UserEntity }>;
}
