import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiQuery } from '@nestjs/swagger';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  // 获取字典表
  @Get('getDict')
  @ApiQuery({ name: 'dict_code', description: '字典码' })
  getDict(@Query() query) {
    return this.appService.getDict(query.dict_code);
  }

  // 获取所有字典表
  @Get('getDictAll')
  getDictAll() {
    return this.appService.getDictAll();
  }
}
