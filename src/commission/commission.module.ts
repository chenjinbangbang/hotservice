import { Module } from '@nestjs/common';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission } from 'src/entity/commission.entity';
import { User } from 'src/entity/user.entity';
import { Platform } from 'src/entity/platform.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commission, User, Platform])],
  controllers: [CommissionController],
  providers: [CommissionService]
})
export class CommissionModule { }
