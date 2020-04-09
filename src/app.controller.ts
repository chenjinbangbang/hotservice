import { Controller, Get, UseGuards, Post, Request, Headers, Head, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiProperty, ApiBody, ApiHeader, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('全局接口')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    // console.log(__dirname);
    // console.log(__filename);
    // console.log(process);
    // console.log(URL);
  }

  // 测试接口是否正常
  @Get()
  @ApiOperation({ summary: '测试接口是否正常' })
  getHello(): object {
    return this.appService.getHello();
  }
}
