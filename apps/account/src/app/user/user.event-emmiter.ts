import { RMQService } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';

export class UserEventEmmiter {
  constructor(private readonly rmqService: RMQService) {}

  async handle(user: UserEntity) {
    for (const event of user.events) {
      await this.rmqService.notify(event.topic, event.data);
    }
  }
}
