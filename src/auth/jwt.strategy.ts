import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // 提供从请求中提取JWT的方法
      ignoreExpiration: false, // 默认false设置，它将确保JWT没有过期的责任委托给Passport模块。这意味着，如果我们的路由提供了一个过期的JWT，请求将被拒绝，并发送401未经授权的响应
      secretOrKey: jwtConstants.secret // 使用权宜的选项来提供对称的秘密来签署令牌
    })
  }

  // 对于JWT策略，Passport首先验证JWT的签名并解码JSON。然后调用我们的validate()方法，该方法将解码后的JSON作为其单个参数传递（获取token里面的用户信息，用于返回用户信息）
  async validate(payload: any) {
    console.log('用户信息：', payload);
    const { sub, username, isVip, gold, wealth } = payload;
    return { id: sub, username, isVip, gold, wealth };
  }
}