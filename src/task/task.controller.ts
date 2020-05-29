import { Controller, Post, Body, Get, Put, Patch, Query, Request, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiOperation, ApiTags, ApiProperty, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TaskListAdminSearchDto, StatusDto, PublishTaskDto, TaskSimpleDto, TaskIdDto, TaskListOriginDto, TaskListDetailOriginDto, RobTaskDto, PlatformNameCheckDto, TaskListUserSearchDto } from './dto/task.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('任务相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  // ====================================== 公共接口 ======================================
  // 更改任务状态（后台管理：更改为违规状态status=6，创作者：更改为审核通过status=3，审核不通过status=4，刷手：完成任务（status=2），放弃任务（status=0），任务审核通过（status=3））
  @Put('status')
  @ApiOperation({ summary: '更改任务状态（后台管理，创作者，刷手）' })
  changeStatus(@Request() req, @Body() body: StatusDto) {
    return this.taskService.changeStatus(req.user, body);
  }


  // ====================================== 后台管理 ======================================
  // 获取任务统计数据（后台管理）
  @Get('stat')
  @ApiOperation({ summary: '获取任务统计数据（后台管理）' })
  getStat() {
    return this.taskService.getStat();
  }

  // 获取子任务列表（后台管理，根据id查询）
  @Post('list/by_admin')
  @ApiOperation({ summary: '获取子任务列表（后台管理，根据id查询）' })
  getListByAdmin(@Body() body: TaskListAdminSearchDto) {
    return this.taskService.getListByAdmin(body);
  }


  // ====================================== 创作者 ======================================
  // 发布任务（创作者）
  @Post('create')
  @ApiOperation({ summary: '发布任务（创作者）' })
  publishTask(@Request() req, @Body() body: PublishTaskDto) {
    return this.taskService.publishTask(req.user, body);
  }

  // 获取创作者的父任务统计数据（创作者）
  @Get('stat/by_origin')
  @ApiOperation({ summary: '获取创作者的父任务统计数据（创作者）' })
  getStatByOrigin(@Request() req) {
    return this.taskService.getStatByOrigin(req.user);
  }

  // 获取创作者的父任务列表（创作者，根据task_id查询）
  @Post('list/by_origin')
  @ApiOperation({ summary: '获取创作者的父任务列表（创作者，根据task_id查询）' })
  getListByOrigin(@Request() req, @Body() body: TaskListOriginDto) {
    return this.taskService.getListByOrigin(req.user, body);
  }

  // 取消父任务（创作者）
  @Patch('cancel')
  @ApiOperation({ summary: '取消父任务（创作者）' })
  taskCancel(@Request() req, @Body() body: TaskIdDto) {
    return this.taskService.taskCancel(req.user, body);
  }

  // 获取某个父任务下的子任务详情（创作者，根据task_id查询）
  @Get('detail/by_task_id')
  @ApiOperation({ summary: '获取某个父任务下的子任务详情（创作者，根据task_id查询）' })
  @ApiQuery({ name: 'task_id', description: '父任务编号', type: 'number' })
  getTaskDetailByTaskId(@Request() req, @Query('task_id', ParseIntPipe) task_id) {
    return this.taskService.getTaskDetailByTaskId(req.user, task_id);
  }

  // 获取某个父任务下的子任务列表（创作者，根据task_id查询）
  @Get('detail/list/by_task_id')
  @ApiOperation({ summary: '获取某个父任务下的子任务列表（创作者，根据task_id查询）' })
  getTaskDetailListByTaskId(@Request() req, @Query() query: TaskListDetailOriginDto) {
    return this.taskService.getTaskDetailListByTaskId(req.user, query);
  }

  // ====================================== 刷手 ======================================
  // 获取可接任务列表（刷手）
  @Get('list/simple')
  @ApiOperation({ summary: '获取可接任务列表（刷手）' })
  getListSimple(@Request() req, @Query() query: TaskSimpleDto) {
    return this.taskService.getListSimple(req.user, query);
  }

  // 获取子任务详情（刷手）
  @Get('detail/by_id')
  @ApiOperation({ summary: '获取子任务详情（刷手）' })
  @ApiQuery({ name: 'id', description: '子任务编号', type: 'number' })
  getTaskDetailById(@Request() req, @Query('id', ParseIntPipe) id) {
    return this.taskService.getTaskDetailById(req.user, id);
  }
  
  // 验证发布平台账号（刷手）
  @Get('platform/platform_name/check')
  @ApiOperation({ summary: '验证发布平台账号（刷手）' })
  platformNameCheck(@Request() req, @Query() query: PlatformNameCheckDto) {
    return this.taskService.platformNameCheck(req.user, query);
  }

  // 抢任务（刷手）
  @Put('rob')
  @ApiOperation({ summary: '抢任务（刷手）' })
  taskRob(@Request() req, @Body() body: RobTaskDto) {
    return this.taskService.taskRob(req.user, body);
  }

  // 预览时间开始计时（刷手）
  // @Post('preview')
  // @ApiOperation({ summary: '预览时间开始计时（刷手）' })
  // @ApiQuery({ name: 'id', description: '子任务编号', type: 'number' })
  // taskPreview(@Request() req, @Query('id', ParseIntPipe) id) {
  //   return this.taskService.taskPreview(req.user, id);
  // }

  // 获取刷手的子任务统计数据（刷手）
  @Get('stat/by_user')
  @ApiOperation({ summary: '获取刷手的子任务统计数据（刷手）' })
  getStatByUser(@Request() req) {
    return this.taskService.getStatByUser(req.user);
  }

  // 获取刷手的子任务列表（刷手，根据id查询）
  @Post('list/by_user')
  @ApiOperation({ summary: '获取刷手的子任务列表（刷手，根据id查询）' })
  getListByUser(@Request() req, @Body() body: TaskListUserSearchDto) {
    return this.taskService.getListByUser(req.user, body);
  }

}
