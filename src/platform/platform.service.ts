import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Platform } from 'src/entity/platform.entity';
import { Repository } from 'typeorm';
import { resFormat } from 'src/common/global';
import { BasicService } from 'src/basic/basic.service';

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(Platform) private readonly platformRepo: Repository<Platform>,
    private readonly basicService: BasicService
  ) { }

  // 获取当前用户的平台账号列表
  async getListById(user) {
    let res: any[] = await this.platformRepo.find({ user_id: user.id });

    // [[{platform_type: 0}...],[{platform_type: 1}...],[{platform_type: 2}...],[{platform_type: 3}...]]
    let arr: Array<any> = [[],[],[],[]];
    for(let item of res) {
      arr[item.platform_type].push(item);
    }

    return resFormat(true, arr, null);
  }


  // 获取某个平台账号的信息
  async getDetail(data) {
    let res = await this.platformRepo.findOne({ id: data.id });

    if (res) {
      return resFormat(true, res, null);
    } else {
      return resFormat(true, '查不到该平台账号', null);
    }
  }

  // 添加平台账号
  async create(user, data) {
    let count = await this.platformRepo.count({ user_id: user.id, platform_type: data.platform_type });
    if (count >= 3) {
      return resFormat(false, null, '每个平台最多可提交3个账号');
    }

    data.user_id = user.id; // 添加user_id

    // let platform_typeDict = await this.basicService.getDict('platform_dict');
    // console.log(platform_typeDict);
    // let platform_type = platform_typeDict.data[data.platform_type]
    let platform_typeObj = {
      0: '头条号',
      1: '抖音号',
      2: '火山号',
      3: '快手号'
    }

    let platform = await this.platformRepo.create(data);
    let res = await this.platformRepo.save(platform);

    return resFormat(true, null, `添加${platform_typeObj[data.platform_type]}成功`);
  }

  // 编辑平台账号
  async alter(data) {
    let isExist = await this.platformRepo.findOne(data.id);
    if (!isExist) {
      return resFormat(true, '查不到该平台账号', null);
    }

    let res = await this.platformRepo.update(data.id, data);
    console.log(res);

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '编辑平台账号成功');
    } else {
      return resFormat(false, null, '编辑平台账号失败');
    }
  }

  // 删除平台账号
  async delete(data) {
    let isExist = await this.platformRepo.findOne(data.id);
    if (!isExist) {
      return resFormat(true, '查不到该平台账号', null);
    }

    let res = await this.platformRepo.delete(data.id);
    console.log(res);

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '删除平台账号成功');
    } else {
      return resFormat(false, null, '删除平台账号失败');
    }
  }

  // 获取平台账号列表（后台管理）
  async getList(data) {
    console.log(data);

    let searchData: any = {};
    for (let key in data) {
      if (!['page', 'pageNum', 'create_time'].includes(key)) {
        searchData[key] = `%${data[key]}%`;
      }
    }
    console.log(searchData)

    // let res: any = await this.platformRepo.find();
    let res: any = await this.platformRepo.createQueryBuilder('platform')
      .where('(name like :search or platform_num like :search)')
      .andWhere('status like :status and reason like :reason')
      .where(data.create_time ? 'create_time between :create_time1 and :create_time2' : '', { create_time1: data.create_time ? data.create_time[0] : '', create_time2: data.create_time ? data.create_time[1] : '' })
      .offset((data.page - 1) * data.pageNum)
      .limit(data.pageNum)
      .setParameters(searchData)
      .getMany();

    // 获取省市区
    let promises: any[] = [];
    res.forEach(item => {
      let p = new Promise(async resolve => {

        // 获取开户行名称
        // let platformDict = await this.basicService.getDict('platform_dict');
        // item.platform_deposit = platformDict.data[item.platform_deposit_id];

        // 获取审核不通过原因
        let reasonDict = await this.basicService.getDict('platform_reason_dict');
        item.reason

        // 获取省市区字符串
        let region = await this.basicService.getAreaRegion({ provinceId: item.platform_province, cityId: item.platform_city, districtId: item.platform_area });

        delete item.platform_province;
        delete item.platform_city;
        delete item.platform_area;
        item.region = region.data;

        resolve(item);
      })

      promises.push(p);
    })
    // console.log(promises);

    let newRes = await Promise.all(promises);

    let count = await this.platformRepo.count();

    return resFormat(true, { lists: newRes, total: count }, null);
  }


  // 平台账号审核状态是否通过（后台管理）
  async checkStatus(data) {
    const { id, status, reason } = data
    let isExist = await this.platformRepo.findOne(id);
    if (!isExist) {
      return resFormat(true, '查不到该平台账号', null);
    }

    if (![1, 2].includes(status)) {
      return resFormat(true, '平台账号状态参数异常', null);
    }

    // 若审核状态为1，则审核不通过原因必传
    if (status === 1 && !reason) {
      return resFormat(true, '审核状态为1时，审核不通过原因必传', null);
    }

    let res = await this.platformRepo.update(id, data);

    if (res.raw.affectedRows > 0) {
      if (status === 2) {
        return resFormat(true, null, '平台账号审核已通过');
      } else if (status === 1) {
        return resFormat(true, null, '平台账号审核未通过');
      }
    } else {
      return resFormat(false, null, '修改平台账号审核状态失败');
    }
  }

}
