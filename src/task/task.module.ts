import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/entity/task.entity';
import { User } from 'src/entity/user.entity';
import { WealthModule } from 'src/wealth/wealth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User]), WealthModule],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule { }
