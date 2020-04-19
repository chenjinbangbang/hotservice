import { Module } from '@nestjs/common';
import { WealthController } from './wealth.controller';
import { WealthService } from './wealth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wealth } from 'src/entity/wealth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wealth])],
  controllers: [WealthController],
  providers: [WealthService],
  exports: [WealthService]
})
export class WealthModule { }
