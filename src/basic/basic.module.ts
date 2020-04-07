import { Module } from '@nestjs/common';
import { BasicService } from './basic.service';
import { BasicController } from './basic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dict } from 'src/entity/dict.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dict])],
  controllers: [BasicController],
  providers: [BasicService]
})
export class BasicModule { }
