import { Controller, Get, Query, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepositService } from './deposit.service';
import { SearchDepositDto, StatusDepositDto } from './dto/deposit.dto';
import { AuthGuard } from '@nestjs/passport';
import { Transaction } from 'typeorm';
import { PageDto } from 'src/common/dto';

@ApiTags('提现相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) { }

  // 获取当前用户的提现记录列表
  @Get('list/byId')
  @ApiOperation({ summary: '获取当前用户的提现记录列表' })
  getListById(@Request() req, @Query() query: PageDto) {
    return this.depositService.getListById(req.user, query);
  }

  // 获取提现记录列表（后台管理）
  @Get('list')
  @ApiOperation({ summary: '获取提现记录列表（后台管理）' })
  getList(@Query() query: SearchDepositDto) {
    return this.depositService.getList(query);
  }

  // 更改提现状态（后台管理）
  @Put('status')
  // @Transaction() // 处理事务
  @ApiOperation({ summary: '更改提现状态（后台管理）' })
  checkStatus(@Body() body: StatusDepositDto) {
    return this.depositService.checkStatus(body);
  }
}
