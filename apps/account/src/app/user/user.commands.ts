import { Body, Controller } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import {
  AccountBuyCourse,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@purple/contracts';
import { UserEntity } from './entities/user.entity';
import { BuyCourseSaga } from './sagas/buy-course.saga';

@Controller()
export class UserCommands {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqServise: RMQService
  ) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async userInfo(@Body() { id, user }: AccountChangeProfile.Request) {
    const existedUser = await this.userRepository.findUserById(id);

    if (!existedUser) {
      throw new Error('Запрашиваемого пользователя не существует');
    }

    const userEntity = new UserEntity(existedUser).updateProfile(
      user.displayName
    );

    await this.userRepository.updateUser(userEntity);
    return {};
  }

  @RMQValidate()
  @RMQRoute(AccountBuyCourse.topic)
  async buyCourse(
    @Body() { userId, courseId }: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new Error('Пользователь не существует');
    }

    const userEntity = new UserEntity(user);
    const saga = new BuyCourseSaga(courseId, userEntity, this.rmqServise);
    const result = await saga.getState().pay();
    await this.userRepository.updateUser(result.user);

    return { paymentUrl: result.paymentLink };
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  async checkPayment(
    @Body() { userId, courseId }: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    const existedUser = await this.userRepository.findUserById(userId);
    if (!existedUser) {
      throw new Error('Пользователь не существует');
    }

    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(courseId, userEntity, this.rmqServise);
    const { user, status } = await saga.getState().checkPayment();

    await this.userRepository.updateUser(user);

    return { status };
  }
}
