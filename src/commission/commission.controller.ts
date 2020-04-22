import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommissionService } from './commission.service';
import { PageDto } from 'src/common/dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('推广分享相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('commission')
export class CommissionController {
  constructor(private readonly commissonService: CommissionService) { }

  // 获取本月获取佣金和总计获取佣金数据
  @Get('stat')
  @ApiOperation({ summary: '获取本月获取佣金和总计获取佣金数据' })
  getStat(@Request() req) {
    return this.commissonService.getStat(req.user);
  }

  // 获取佣金记录列表
  @Get('list')
  @ApiOperation({ summary: '获取佣金记录列表' })
  getList(@Request() req, @Query() query: PageDto) {
    return this.commissonService.getList(req.user, query);
  }

  // 获取推广记录列表
  @Get('generalize/list')
  @ApiOperation({ summary: '获取推广记录列表' })
  getGeneralizeList(@Request() req, @Query() query: PageDto) {
    return this.commissonService.getGeneralizeList(req.user, query);
  }
}
