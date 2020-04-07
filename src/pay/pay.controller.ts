import { Controller, Get, Query, ParseIntPipe, Post, Body, Head, Put } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiBody, ApiHeader, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PayService } from './pay.service';
import { PayCreateDto, PayStatusDto, PayDto } from './dto/pay.dto';
import { pageDto } from 'src/common/dto';
import { IsInt } from 'class-validator';

@ApiTags('充值相关')
@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) { }

  // 获取充值记录
  @Get('list')
  @ApiQuery({ name: 'pageNum', description: '一页的条数', type: 'number' })
  @ApiQuery({ name: 'page', description: '当前页', type: 'number' })
  @ApiResponse({ type: [PayDto] })
  getList(@Query() query: pageDto) {
    console.log(query);
    return this.payService.getList(query);
  }

  // 用户充值（需要添加一条日志）
  @Post('wealth')
  @ApiBody({ type: PayCreateDto })
  reCharge(@Body() body) {
    console.log(body)
    return this.payService.reCharge(body);
  }

  // 充值审核（需要添加一条日志）
  @Put('status')
  @ApiBody({ type: PayStatusDto })
  payStatus(@Body() body: PayStatusDto) {
    console.log(body);
    return this.payService.payStatus(body);
  }


}