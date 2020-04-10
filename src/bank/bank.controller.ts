import { Controller, Get, Query, Post, Body, Put, Delete } from '@nestjs/common';
import { BankService } from './bank.service';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { createBankDto, alterBankDto, statusDto } from './dto/bank.dto';

@ApiTags('银行卡相关')
@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) { }

  // 获取银行卡列表（后台管理）
  @Get('list')
  @ApiOperation({ summary: '获取银行卡列表（后台管理）' })
  getList() {
    return this.bankService.getList();
  }

  // 获取某个银行卡的信息
  @Get('detail')
  @ApiOperation({ summary: '获取某个银行卡的信息' })
  @ApiQuery({ name: 'id', description: '银行卡编号', type: 'number' })
  getDetail(@Query() query) {
    return this.bankService.getDetail(query.id);
  }

  // 添加银行卡
  @Post('create')
  @ApiOperation({ summary: '添加银行卡' })
  create(@Body() body: createBankDto) {
    return this.bankService.create(body);
  }

  // 修改银行卡
  @Put('alter')
  @ApiOperation({ summary: '修改银行卡' })
  alter(@Body() body: alterBankDto) {
    return this.bankService.alter(body);
  }

  // 删除银行卡
  @Delete('delete')
  @ApiOperation({ summary: '删除银行卡' })
  @ApiQuery({ name: 'id', description: '银行卡编号', type: 'number' })
  delete(@Query() query) {
    return this.bankService.delete(query);
  }

  // 审核是否通过（后台管理）
  @Put('status')
  @ApiOperation({ summary: '审核是否通过（后台管理）' })
  checkStatus(@Body() body: statusDto) {
    return this.bankService.checkStatus(body);
  }

}
