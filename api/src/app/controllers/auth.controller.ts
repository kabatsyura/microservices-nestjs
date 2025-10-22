import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AccountLogin, AccountRegister } from '@purple/contracts';
import { RMQService } from 'nestjs-rmq';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO } from '../dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly rmqService: RMQService) {}

  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    try {
      return await this.rmqService.send<
        AccountRegister.Request,
        AccountRegister.Response
      >(AccountRegister.topic, dto, { headers: { requestId: 'adad' } });
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message);
      }
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDTO) {
    try {
      const res = await this.rmqService.send<
        AccountLogin.Request,
        AccountLogin.Response
      >(AccountLogin.topic, dto);

      return res;
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message);
      }
    }
  }
}
