import { Module } from '@nestjs/common';
import { PayController } from './pay.controller';
import { PayService } from './pay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pay } from 'src/entity/pay.entity';
import { User } from 'src/entity/user.entity';

/**
 * 充值模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Pay, User])],
  controllers: [PayController],
  providers: [PayService]
})
export class PayModule { }
