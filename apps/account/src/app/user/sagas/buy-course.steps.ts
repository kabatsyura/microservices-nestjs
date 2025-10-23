import {
  CourseGetCourse,
  PaymentCheck,
  PaymentGenerateLink,
} from '@purple/contracts';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseState } from './buy-course.state';
import { PurchaseState } from 'interfaces/src/lib/user.interface';

export class BuyCourseSagaStateStarted extends BuyCourseState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<
      CourseGetCourse.Request,
      CourseGetCourse.Response
    >(CourseGetCourse.topic, { id: this.saga.courseId });

    if (!course) {
      throw new Error('Такого курса не существует');
    }

    if (course.price === 0) {
      this.saga.setStatus(PurchaseState.Purchased, course._id);

      return { paymentLink: null, user: this.saga.userEntity };
    }

    const { paymentLink } = await this.saga.rmqService.send<
      PaymentGenerateLink.Request,
      PaymentGenerateLink.Response
    >(PaymentGenerateLink.topic, {
      courseId: course._id,
      userId: this.saga.userEntity._id,
      sum: course.price,
    });

    this.saga.setStatus(PurchaseState.WaitingForPayment, course._id);

    return { paymentLink, user: this.saga.userEntity };
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentCheck }> {
    throw new Error('Нельзя проверить платеж, который не начался');
  }

  public async canceled(): Promise<{ user: UserEntity }> {
    this.saga.setStatus(PurchaseState.Canceled, this.saga.courseId);
    return { user: this.saga.userEntity };
  }
}

export class BuyCourseSagaStateWaitingForPayment extends BuyCourseState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('Нельзя создать повторно ссылку на ранее созданный платеж');
  }

  public async checkPayment(): Promise<{
    user: UserEntity;
    status: PaymentCheck;
  }> {
    const { status } = await this.saga.rmqService.send<
      PaymentCheck.Request,
      PaymentCheck.Response
    >(PaymentCheck.topic, {
      courseId: this.saga.courseId,
      userId: this.saga.userEntity._id,
    });

    if (status === 'canceled') {
      this.saga.setStatus(PurchaseState.Canceled, this.saga.courseId);
      return { user: this.saga.userEntity, status: 'canceled' };
    }

    if (status !== 'success') {
      return { user: this.saga.userEntity, status: 'success' };
    }

    this.saga.setStatus(PurchaseState.Purchased, this.saga.courseId);
    return { user: this.saga.userEntity, status: 'progress' };
  }

  public canceled(): Promise<{ user: UserEntity }> {
    throw new Error('Невозможно отменить платеж, который в процессе');
  }
}

export class BuyCourseSagaStatePurchased extends BuyCourseState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('Нельзя оплатить купленный курс');
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentCheck }> {
    throw new Error('Нельзя проверить платеж по купленному курсу');
  }

  public canceled(): Promise<{ user: UserEntity }> {
    throw new Error('Нельзя отменить купленный курс');
  }
}

export class BuyCourseSagaStateCanceled extends BuyCourseState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setStatus(PurchaseState.Started, this.saga.courseId);
    return this.saga.getState().pay();
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentCheck }> {
    throw new Error('Нельзя проверить платеж по отмененному курсу');
  }

  public canceled(): Promise<{ user: UserEntity }> {
    throw new Error(
      'Нельзя отменить купленный курс, который был отменен ранее'
    );
  }
}
