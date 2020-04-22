import { Controller, UseGuards, Get, Query, Request, Param } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { ApiTags, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PageDto } from 'src/common/dto';

@ApiTags('公告相关')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) { }

  // 获取公告列表
  @Get('list')
  getList(@Query() query: PageDto) {
    return this.noticeService.getList(query);
  }

  // 获取某个公告详情
  @Get('detail')
  @ApiQuery({ name: 'id', description: '公告编号' })
  getDetail(@Query() query) {
    return this.noticeService.getDetail(query);
  }
}
