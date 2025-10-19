import { ConfigModule, ConfigService } from '@nestjs/config';
import { IRMQServiceAsyncOptions } from 'nestjs-rmq';

export const getRMQConfig = (): IRMQServiceAsyncOptions => ({
  inject: [ConfigService],
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    exchangeName: configService.get('AMPQ_EXCHANGE'),
    connections: [
      {
        login: configService.get('AMPQ_USER') ?? '',
        password: configService.get('AMPQ_PASSWORD') ?? '',
        host: configService.get('AMPQ_HOST'),
      },
    ],
    queueName: configService.get('AMPQ_QUEUE'),
    prefetchCount: 32,
    serviceName: 'purple-account',
  }),
});
