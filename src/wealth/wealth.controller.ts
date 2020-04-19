import { Controller, Post, Get, Request, Query, UseGuards } from '@nestjs/common';
import { WealthService } from './wealth.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchWealthDto } from './dto/wealth.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('财务明细相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('wealth')
export class WealthController {
  constructor(private readonly wealthService: WealthService) { }

  // 获取当前用户的财务明细列表
  @Get('list')
  @ApiOperation({ summary: '获取当前用户的财务明细列表' })
  getList(@Request() req, @Query() query: SearchWealthDto) {
    return this.wealthService.getList(req.user, query);
  }
}
