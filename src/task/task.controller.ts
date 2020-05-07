import { Controller, Post, Body, Get, Put, Patch, Query, Request, UseGuards, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiOperation, ApiTags, ApiProperty, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TaskSearchDto, IdDto, PublishTaskDto, taskSimpleDto } from './dto/task.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('任务相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  // 获取任务列表（后台管理，根据id查询查询）
  @Post('list/by_id')
  @ApiOperation({ summary: '获取任务列表（后台管理，根据id查询查询）' })
  getListById(@Body() body: TaskSearchDto) {
    return this.taskService.getListById(body);
  }

  // 获取任务统计数据（后台管理）
  @Get('stat')
  @ApiOperation({ summary: '获取任务统计数据（后台管理）' })
  getStat() {
    return this.taskService.getStat();
  }

  // 更改任务状态为违规状态（后台管理）
  @Patch('status')
  @ApiOperation({ summary: '更改任务状态为违规状态（后台管理）' })
  changeStatus(@Body() body: IdDto) {
    return this.taskService.changeStatus(body);
  }

  // 发布任务（创作者）
  @Post('create')
  @ApiOperation({ summary: '发布任务（创作者）' })
  publishTask(@Request() req, @Body() body: PublishTaskDto) {
    return this.taskService.publishTask(req.user, body);
  }

  // 获取可接任务列表（刷手）
  @Get('list/simple')
  @ApiOperation({ summary: '获取可接任务列表（刷手）' })
  getListSimple(@Request() req, @Query() query: taskSimpleDto) {
    console.log(query);
    return this.taskService.getListSimple(req.user, query);
  }


}
