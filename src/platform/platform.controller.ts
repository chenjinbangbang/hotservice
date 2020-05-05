import { Controller, Get, Query, Post, Body, Put, Delete, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { ApiOperation, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

import { CreatePlatformDto, AlterPlatformDto, StatusPlatformDto, SearchPlatformDto, StatusFreezeDto } from './dto/platform.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('平台账号相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) { }

  // 获取当前用户的平台账号列表
  @Get('list/byId')
  @ApiOperation({ summary: '获取当前用户的平台账号列表' })
  getListById(@Request() req) {
    console.log(req.user);
    return this.platformService.getListById(req.user);
  }

  // 根据平台类型获取平台账号列表
  @Get('list/byPlatformType')
  @ApiOperation({ summary: '根据平台类型获取平台账号列表' })
  @ApiQuery({ name: 'platform_type', description: '平台类型（0：今日头条 1：抖音短视频 2：火山小视频，3：快手）', type: 'number' })
  getListByPlatformType(@Request() req, @Query('platform_type', ParseIntPipe) platform_type) {
    console.log(req.user);
    return this.platformService.getListByPlatformType(req.user, platform_type);
  }

  // 获取某个平台账号的信息
  @Get('detail')
  @ApiOperation({ summary: '获取某个平台账号的信息' })
  @ApiQuery({ name: 'id', description: '平台账号编号', type: 'number' })
  getDetail(@Request() req, @Query('id', ParseIntPipe) id) {
    return this.platformService.getDetail(req.user, id);
  }

  // 添加平台账号
  @Post('create')
  @ApiOperation({ summary: '添加平台账号' })
  create(@Request() req, @Body() body: CreatePlatformDto) {
    console.log(req.user);
    return this.platformService.create(req.user, body);
  }

  // 修改平台账号
  @Put('alter')
  @ApiOperation({ summary: '修改平台账号' })
  alter(@Request() req, @Body() body: AlterPlatformDto) {
    return this.platformService.alter(req.user, body);
  }

  // 删除平台账号
  @Delete('delete')
  @ApiOperation({ summary: '删除平台账号' })
  @ApiQuery({ name: 'id', description: '平台账号编号', type: 'number' })
  delete(@Request() req, @Query('id', ParseIntPipe) id) {
    return this.platformService.delete(req.user, id);
  }

  // 获取平台账号列表（后台管理）
  @Post('list')
  @ApiOperation({ summary: '获取平台账号列表（后台管理）' })
  getList(@Body() body: SearchPlatformDto) {
    return this.platformService.getList(body);
  }

  // 审核平台账号（后台管理）
  @Put('status/check')
  @ApiOperation({ summary: '审核平台账号（后台管理）' })
  checkStatus(@Body() body: StatusPlatformDto) {
    return this.platformService.checkStatus(body);
  }

  // 冻结/解冻平台账号（后台管理）
  @Put('status/freeze')
  @ApiOperation({ summary: '冻结/解冻平台账号（后台管理）' })
  freezeStatus(@Body() body: StatusFreezeDto) {
    return this.platformService.freezeStatus(body);
  }

}
