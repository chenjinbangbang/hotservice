import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from 'src/entity/platform.entity';
import { BasicModule } from 'src/basic/basic.module';

@Module({
  imports: [TypeOrmModule.forFeature([Platform]), BasicModule],
  controllers: [PlatformController],
  providers: [PlatformService]
})
export class PlatformModule { }
