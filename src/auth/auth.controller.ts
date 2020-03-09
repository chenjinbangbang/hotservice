import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // 验证用户名是否存在
  @Get('check/username/:username')
  async checkUsername(@Param('username') username: string) {
    return await this.authService.checkUsername(username);
  }

}
