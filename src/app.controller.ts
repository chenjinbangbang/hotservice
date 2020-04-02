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
  @Get('basic/dict')
  @ApiQuery({ name: 'dict_code', description: '字典码' })
  getDict(@Query() query) {
    return this.appService.getDict(query.dict_code);
  }

  // 获取所有字典表
  @Get('basic/dictAll')
  getDictAll() {
    return this.appService.getDictAll();
  }

  // 获取省市区
  @Get('basic/area')
  getArea() {
    return this.appService.getArea()
  }

  // 获取省市区字符串
  @Get('basic/area/region')
  @ApiQuery({ name: 'provinceId', required: false, description: '省份id' })
  @ApiQuery({ name: 'cityId', required: false, description: '城市id' })
  @ApiQuery({ name: 'districtId', required: false, description: '区域id' })
  getAreaRegion(@Query() query) {
    return this.appService.getAreaRegion(query);
  }
}
