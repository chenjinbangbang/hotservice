import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dict } from './entity/dict.entity';
import { resFormat } from './common/global';

@Injectable()
export class AppService {
  constructor(@InjectRepository(Dict) private readonly dictRepo: Repository<Dict>) { }

  getHello(): string {
    return 'Hello World!';
  }

  // 获取字典表
  async getDict(dict_code) {
    let res = await this.dictRepo.find({ dict_code });
    // let res = await this.dictRepo.createQueryBuilder('dict')
    //   // .select('code_index', 'key')
    //   .select(['code_index', 'index_name_cn'])
    //   // .getRawMany();
    //   .getMany();

    let data: object = {}
    for (let item of res) {
      data[item.code_index] = item.index_name_cn
    }

    return resFormat(true, data, null);
    // return data;
  }

  // 查询所有字典表
  async getDictAll() {
    let res = await this.dictRepo.createQueryBuilder('dict')
      .select(['dict_code', 'dict_name'])
      // .groupBy('dict.dict_code')
      // .having('dict_')
      .getRawMany();

    return resFormat(true, res, null);
  }
}
