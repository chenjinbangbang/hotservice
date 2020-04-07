import { Injectable } from '@nestjs/common';
import { resFormat } from 'src/common/global';

@Injectable()
export class AppService {
  getHello(): object {
    return resFormat(true, '测试接口是否正常', null);
  }
}
