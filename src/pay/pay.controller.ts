import { Controller, Get, Query, ParseIntPipe, Post, Body, Head, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiBody, ApiHeader, ApiProperty, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayService } from './pay.service';
import { PayCreateDto, PayStatusDto, PayDto } from './dto/pay.dto';
import { PageDto } from 'src/common/dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('充值相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) { }

  // 获取充值记录
  @Get('list')
  @ApiOperation({ summary: '获取充值记录' })
  getList(@Request() req, @Query() query: PageDto) {
    console.log(query);
    return this.payService.getList(req.user, query);
  }

  // 用户充值（需要添加一条日志）
  @Post('wealth')
  @ApiOperation({ summary: '用户充值' })
  @ApiBody({ type: PayCreateDto })
  reCharge(@Request() req, @Body() body) {
    console.log(body)
    return this.payService.reCharge(req.user, body);
  }

  // 更改充值状态（后台管理）（需要添加一条日志）
  @Put('status')
  @ApiOperation({ summary: '更改充值状态（后台管理，暂无入口）' })
  @ApiBody({ type: PayStatusDto })
  payStatus(@Body() body: PayStatusDto) {
    console.log(body);
    return this.payService.payStatus(body);
  }


}
