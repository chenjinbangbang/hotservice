import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from 'src/entity/deposit.entity';
import { User } from 'src/entity/user.entity';
import { WealthModule } from 'src/wealth/wealth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deposit, User]), WealthModule],
  controllers: [DepositController],
  providers: [DepositService],
  exports: [DepositService]
})
export class DepositModule { }
