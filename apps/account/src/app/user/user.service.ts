import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RMQService } from 'nestjs-rmq';
import { IUser } from '@purple/interfaces';
import { UserEntity } from './entities/user.entity';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEventEmmiter } from './user.event-emmiter';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqServise: RMQService,
    private readonly userEventEmmiter: UserEventEmmiter
  ) {}

  public async changeProfile(id: string, user: Pick<IUser, 'displayName'>) {
    const existedUser = await this.userRepository.findUserById(id);

    if (!existedUser) {
      throw new Error('Запрашиваемого пользователя не существует');
    }

    const userEntity = new UserEntity(existedUser).updateProfile(
      user.displayName
    );

    await this.updateUser(userEntity);

    return {};
  }

  public async buyCourse(userId: string, courseId: string) {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new Error('Пользователь не существует');
    }

    const userEntity = new UserEntity(user);
    const saga = new BuyCourseSaga(courseId, userEntity, this.rmqServise);
    const result = await saga.getState().pay();

    await this.updateUser(userEntity);

    return { paymentUrl: result.paymentLink };
  }

  async checkPayment(userId: string, courseId: string) {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new Error('Пользователь не существует');
    }

    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(courseId, userEntity, this.rmqServise);
    const { user, status } = await saga.getState().checkPayment();

    await this.updateUser(user);

    return { status };
  }

  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userEventEmmiter.handle(user),
      this.userRepository.updateUser(user),
    ]);
  }
}
