import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

// 加密crypto
import crypto = require('crypto');
import { resFormat } from 'src/common/global';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  // 验证用户，返回用户信息
  async validate(username: string, password: string): Promise<any> {

    // 加密crypto
    const hash = crypto.createHmac('sha256', password).update('hot').digest('hex');

    const user = await this.authService.validateUser(username, hash);
    if (!user) {
      throw new UnauthorizedException({ message: '用户名或密码不正确' });
      // return resFormat(false, null, '用户名或密码不正确')
    }
    return user;
  }
}