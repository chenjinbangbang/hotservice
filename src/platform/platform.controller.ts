import { Controller, Get, Query, Post, Body, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { ApiOperation, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

import { CreatePlatformDto, AlterPlatformDto, StatusDto, SearchPlatformDto } from './dto/platform.dto';
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

  // 获取某个平台账号的信息
  @Get('detail')
  @ApiOperation({ summary: '获取某个平台账号的信息' })
  @ApiQuery({ name: 'id', description: '平台账号编号', type: 'number' })
  getDetail(@Query() query) {
    return this.platformService.getDetail(query);
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
  alter(@Body() body: AlterPlatformDto) {
    return this.platformService.alter(body);
  }

  // 删除平台账号
  @Delete('delete')
  @ApiOperation({ summary: '删除平台账号' })
  @ApiQuery({ name: 'id', description: '平台账号编号', type: 'number' })
  delete(@Query() query) {
    return this.platformService.delete(query);
  }

  // 获取平台账号列表（后台管理）
  @Post('list')
  @ApiOperation({ summary: '获取平台账号列表（后台管理）' })
  getList(@Body() body: SearchPlatformDto) {
    return this.platformService.getList(body);
  }

  // 审核平台账号（后台管理）
  @Put('status')
  @ApiOperation({ summary: '审核平台账号（后台管理）' })
  checkStatus(@Body() body: StatusDto) {
    return this.platformService.checkStatus(body);
  }

}
