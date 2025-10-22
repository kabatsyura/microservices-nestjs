import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RMQModule } from 'nestjs-rmq';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';

import { getRMQConfig } from './config/rmq.config';
import { getJWTConfig } from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'envs/.api.env', isGlobal: true }),
    RMQModule.forRootAsync(getRMQConfig()),
    JwtModule.registerAsync(getJWTConfig()),
    PassportModule,
  ],
  controllers: [AuthController, UserController],
})
export class AppModule {}
