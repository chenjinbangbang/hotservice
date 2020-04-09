import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

// import { Auth } from './auth.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';

// jwt
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';

/**
 * 登录模块
 */
@Module({
  // imports: [TypeOrmModule.forFeature([Auth])], // 注册实体类
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // 确定默认策略行为
    JwtModule.register({
      secret: jwtConstants.secret, // 秘钥
      signOptions: { expiresIn: jwtConstants.expiresIn } // expiresIn：jwt的过期时间
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {

}
