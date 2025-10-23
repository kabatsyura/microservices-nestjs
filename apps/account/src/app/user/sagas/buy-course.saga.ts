import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { PurchaseState } from 'interfaces/src/lib/user.interface';
import { BuyCourseState } from './buy-course.state';
import {
  BuyCourseSagaStateCanceled,
  BuyCourseSagaStatePurchased,
  BuyCourseSagaStateStarted,
  BuyCourseSagaStateWaitingForPayment,
} from './buy-course.steps';

export class BuyCourseSaga {
  private state: BuyCourseState;

  constructor(
    public courseId: string,
    public userEntity: UserEntity,
    public rmqService: RMQService
  ) {}

  public setStatus(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        this.state = new BuyCourseSagaStateStarted();
        break;
      case PurchaseState.WaitingForPayment:
        this.state = new BuyCourseSagaStateWaitingForPayment();
        break;
      case PurchaseState.Purchased:
        this.state = new BuyCourseSagaStatePurchased();
        break;
      case PurchaseState.Canceled:
        this.state = new BuyCourseSagaStateCanceled();
        break;
    }

    this.state.setContext(this);
    this.userEntity.setCourseStatus(courseId, state);
  }

  public getState() {
    return this.state;
  }
}
