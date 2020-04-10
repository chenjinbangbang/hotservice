import { Controller, Get, Query, UseInterceptors, Post, UploadedFile, Req } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiConsumes, ApiBody, ApiProperty, ApiOperation } from '@nestjs/swagger';
import { BasicService } from './basic.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { resFormat } from 'src/common/global';

// 上传文件
import multer = require('multer');
const storage = multer.diskStorage({
  destination(req: any, file: any, cb: (arg0: any, arg1: string) => void) {
    cb(null, 'uploads');
  },
  filename(req: any, file: { originalname: any; }, cb: (arg0: any, arg1: string) => void) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// 上传单个文件的实体
class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary'
  })
  file: any;
}

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

  // 上传文件，返回url
  @Post('upload')
  @ApiOperation({ summary: '上传文件，返回url' })
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FileUploadDto,
    description: '上传单个文件'
  })
  uploadFile(@UploadedFile() file, @Req() req) {
    console.log(file)
    // console.log('headers：', req.headers);
    // console.log('body：', req.body);
    // console.log('baseUrl：', req.baseUrl);
    // console.log('hostname：', req.hostname);
    // console.log('ip：', req.ip);
    // console.log('ips：', req.ips);
    // console.log('originalUrl：', req.originalUrl);
    // console.log('path：', req.path);
    // console.log('protocol：', req.protocol);
    // console.log('route：', req.route);
    if (file) {
      let data = `${req.protocol}://${req.headers.host}/static/${file.filename}`;
      return resFormat(true, data, null);
    } else {
      return resFormat(false, '上传失败', null);
    }
  }

}
