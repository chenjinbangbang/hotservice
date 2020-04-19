import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { WealthModule } from 'src/wealth/wealth.module';
import { DepositModule } from 'src/deposit/deposit.module';
// import { Bank } from 'src/entity/bank.entity';
// import { Pay } from 'src/entity/pay.entity';

/**
 * 用户模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([User]), WealthModule, DepositModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
