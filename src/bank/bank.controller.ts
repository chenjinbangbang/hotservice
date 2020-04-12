import { Controller, Get, Query, Post, Body, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { BankService } from './bank.service';
import { ApiOperation, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

import { CreateBankDto, AlterBankDto, StatusDto, SearchBankDto } from './dto/bank.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('银行卡相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) { }

  // 获取当前用户的银行卡列表
  @Get('list/byId')
  @ApiOperation({ summary: '获取当前用户的银行卡列表' })
  getListById(@Request() req) {
    console.log(req.user);
    return this.bankService.getListById(req.user);
  }

  // 获取某个银行卡的信息
  @Get('detail')
  @ApiOperation({ summary: '获取某个银行卡的信息' })
  @ApiQuery({ name: 'id', description: '银行卡编号', type: 'number' })
  getDetail(@Query() query) {
    return this.bankService.getDetail(query);
  }

  // 添加银行卡
  @Post('create')
  @ApiOperation({ summary: '添加银行卡' })
  create(@Request() req, @Body() body: CreateBankDto) {
    // console.log(req.user);
    return this.bankService.create(req.user, body);
  }

  // 修改银行卡
  @Put('alter')
  @ApiOperation({ summary: '修改银行卡' })
  alter(@Body() body: AlterBankDto) {
    return this.bankService.alter(body);
  }

  // 删除银行卡
  @Delete('delete')
  @ApiOperation({ summary: '删除银行卡' })
  @ApiQuery({ name: 'id', description: '银行卡编号', type: 'number' })
  delete(@Query() query) {
    return this.bankService.delete(query);
  }

  // 获取银行卡列表（后台管理）
  @Post('list')
  @ApiOperation({ summary: '获取银行卡列表（后台管理）' })
  getList(@Body() body: SearchBankDto) {
    return this.bankService.getList(body);
  }

  // 银行卡审核状态是否通过（后台管理）
  @Put('status')
  @ApiOperation({ summary: '银行卡审核状态是否通过（后台管理）' })
  checkStatus(@Body() body: StatusDto) {
    return this.bankService.checkStatus(body);
  }

}
