import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dict } from 'src/entity/dict.entity';
import { Repository } from 'typeorm';
import { resFormat } from 'src/common/global';

@Injectable()
export class BasicService {
  constructor(@InjectRepository(Dict) private readonly dictRepo: Repository<Dict>) { }

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
      .select(['dict_code dictCode', 'dict_name dictName'])
      .groupBy('dict_code')
      .addGroupBy('dict_name')
      .getRawMany();

    return resFormat(true, res, null);
  }

  // 获取省市区
  async getArea() {
    let provinceData = await this.dictRepo.query(`select id areaId, name areaName from area where level = '1'`)
    let cityData = await this.dictRepo.query(`select id areaId, name areaName, pid from area where level = '2'`)
    let areaData = await this.dictRepo.query(`select id areaId, name areaName, pid from area where level = '3'`)

    // 处理省市区数据
    provinceData.forEach(item => {
      item.children = []
      cityData.forEach(item1 => {

        // 添加区域
        item1.children = []
        areaData.forEach(item2 => {
          if (item1.areaId === item2.pid) {
            item1.children.push({
              areaId: item2.areaId,
              areaName: item2.areaName,
              children: []
            })
          }
        })

        // 添加城市
        if (item.areaId === item1.pid) {
          item.children.push({
            areaId: item1.areaId,
            areaName: item1.areaName,
            children: item1.children
          })
        }
      })
    })

    return resFormat(true, provinceData, null);
  }

  // 获取省市区字符串
  async getAreaRegion(data) {
    console.log(data);
    const { provinceId, cityId, districtId } = data;

    let arr = [];
    if (provinceId) {
      let provinceArr = await this.dictRepo.query(`select name from area where id = '${provinceId}'`);
      let province = provinceArr[0].name;
      arr.push(province);
    }


    if (cityId) {
      let cityArr = await this.dictRepo.query(`select name from area where id = '${cityId}'`);
      let city = cityArr[0].name
      arr.push(city);
    }

    if (districtId) {
      let districtArr = await this.dictRepo.query(`select name from area where id = '${districtId}'`);
      let district = districtArr[0].name
      arr.push(district);
    }

    return resFormat(true, arr.join(' '), null);
  }
}
