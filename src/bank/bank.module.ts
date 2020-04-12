import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from 'src/entity/bank.entity';
import { BasicModule } from 'src/basic/basic.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bank]), BasicModule],
  controllers: [BankController],
  providers: [BankService]
})
export class BankModule { }
