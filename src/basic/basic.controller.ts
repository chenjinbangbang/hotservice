import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger';
import { BasicService } from './basic.service';

@ApiTags('基础服务')
@Controller('basic')
export class BasicController {
  constructor(private readonly basicService: BasicService) { }

  // 获取字典表
  @Get('basic/dict')
  @ApiOperation({ summary: '获取字典表' })
  @ApiQuery({ name: 'dict_code', description: '字典码' })
  getDict(@Query() query) {
    return this.basicService.getDict(query.dict_code);
  }

  // 获取所有字典表
  @Get('basic/dictAll')
  @ApiOperation({ summary: '获取所有字典表' })
  getDictAll() {
    return this.basicService.getDictAll();
  }

  // 获取省市区
  @Get('basic/area')
  @ApiOperation({ summary: '获取省市区' })
  getArea() {
    return this.basicService.getArea()
  }

  // 获取省市区字符串
  @Get('basic/area/region')
  @ApiOperation({ summary: '获取省市区字符串' })
  @ApiQuery({ name: 'provinceId', required: false, description: '省份id' })
  @ApiQuery({ name: 'cityId', required: false, description: '城市id' })
  @ApiQuery({ name: 'districtId', required: false, description: '区域id' })
  getAreaRegion(@Query() query) {
    return this.basicService.getAreaRegion(query);
  }
}
