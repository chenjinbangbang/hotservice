import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';

import { Bank } from 'src/entity/bank.entity';
import { User } from 'src/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([Bank, User])],
  controllers: [BankController],
  providers: [BankService]
})
export class BankModule { }
