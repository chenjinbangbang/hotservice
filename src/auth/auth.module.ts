import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { Auth } from './auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Auth])], // 注册实体类
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {

}
