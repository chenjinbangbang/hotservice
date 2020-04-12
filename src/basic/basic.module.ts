import { Module } from '@nestjs/common';
import { BasicController } from './basic.controller';
import { BasicService } from './basic.service';
import { Dict } from 'src/entity/dict.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * 基础服务模块
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Dict])
  ],
  controllers: [BasicController],
  providers: [BasicService],
  exports: [BasicService]
})
export class BasicModule { }
