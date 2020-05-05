import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Platform } from 'src/entity/platform.entity';
import { Repository } from 'typeorm';
import { resFormat, removeRawMany, searchParams, retainMany } from 'src/common/global';
import { BasicService } from 'src/basic/basic.service';
import { User } from 'src/entity/user.entity';

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
    let arr: Array<any> = [[], [], [], []];
    for (let item of res) {
      arr[item.platform_type].push(item);
    }

    return resFormat(true, arr, null);
  }

  // 根据平台类型获取平台账号列表
  async getListByPlatformType(user, platform_type) {
    // console.log(platform_type)

    if (![0, 1, 2, 3].includes(platform_type)) {
      return resFormat(false, null, '平台类型参数异常');
    }

    let res: any[] = await this.platformRepo.find({ user_id: user.id, platform_type });

    // 保留部分数据
    retainMany(res, ['id', 'platform_name']);

    return resFormat(true, res, null);
  }

  // 获取某个平台账号的信息
  async getDetail(user, id) {
    let res = await this.platformRepo.findOne({ user_id: user.id, id });

    if (res) {
      return resFormat(true, res, null);
    } else {
      return resFormat(true, '在当前用户查不到该平台账号', null);
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

  // 修改平台账号
  async alter(user, data) {
    let isExist = await this.platformRepo.findOne({ user_id: user.id, id: data.id });
    if (!isExist) {
      return resFormat(true, '在当前用户查不到该平台账号', null);
    }

    let res = await this.platformRepo.update(data.id, data);
    console.log(res);

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '修改平台账号成功');
    } else {
      return resFormat(false, null, '修改平台账号失败');
    }
  }

  // 删除平台账号
  async delete(user, id) {
    let isExist = await this.platformRepo.findOne({ user_id: user.id, id });
    if (!isExist) {
      return resFormat(true, '在当前用户查不到该平台账号', null);
    }

    let res = await this.platformRepo.delete(id);
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

    let sql = this.platformRepo.createQueryBuilder('platform')
      .select(['platform.*', 'u.username username'])
      .leftJoinAndSelect(User, 'u', 'platform.user_id = u.id')
      .where('(u.username like :search or platform.platform_name like :search)')
      .andWhere('platform.platform_type like :platform_type and platform.status like :status and platform.reason like :reason and platform.freeze_reason like :freeze_reason');

    if (data.create_time && data.create_time.length === 2) {
      sql.andWhere('platform.create_time between :create_time1 and :create_time2', { create_time1: data.create_time[0], create_time2: data.create_time[1] });
    }

    let res: any = await sql
      .offset((data.page - 1) * data.pageNum)
      .limit(data.pageNum)
      .setParameters(searchData)
      .getRawMany();

    // 使用getRawMany()方法时，删除所有原始数据
    removeRawMany(res, 'u_');

    let count: number = await sql.getCount();

    return resFormat(true, { lists: res, total: count }, null);
  }


  // 审核平台账号（后台管理）
  async checkStatus(data) {
    const { id, status, reason } = data
    let isExist = await this.platformRepo.findOne(id);
    if (!isExist) {
      return resFormat(false, '查不到该平台账号', null);
    }

    if (![1, 2].includes(status)) {
      return resFormat(false, '平台账号状态参数异常', null);
    }

    // 若状态为1时，则平台账号审核不通过原因必传
    if (status === 1) {
      if (![0, 1, 2].includes(reason)) {
        return resFormat(false, '平台账号审核不通过原因参数异常', null);
      }
    } else if (status === 2) {
      delete data.reason
    }

    let res = await this.platformRepo.update(id, data);

    if (res.raw.affectedRows > 0) {
      if (status === 2) {
        return resFormat(true, null, '该平台账号审核已通过');
      } else if (status === 1) {
        return resFormat(true, null, '该平台账号审核未通过');
      }
    } else {
      return resFormat(false, null, '修改平台账号审核状态失败');
    }
  }

  // 冻结/解冻平台账号（后台管理）
  async freezeStatus(data) {
    const { id, status, freeze_reason } = data
    let isExist = await this.platformRepo.findOne(id);
    if (!isExist) {
      return resFormat(false, '查不到该平台账号', null);
    }

    if (![2, 3].includes(status)) {
      return resFormat(false, '平台账号状态参数异常', null);
    }

    // 若状态为3时，则平台账号审核不通过原因必传
    if (status === 3) {
      if (![0].includes(freeze_reason)) {
        return resFormat(false, '冻结原因参数异常', null);
      }
    } else if (status === 2) {
      delete data.freeze_reason
    }

    let res = await this.platformRepo.update(id, data);

    if (res.raw.affectedRows > 0) {
      if (status === 2) {
        return resFormat(true, null, '该平台账号已解冻');
      } else if (status === 3) {
        return resFormat(true, null, '该平台账号已冻结');
      }
    } else {
      return resFormat(false, null, '修改平台账号状态失败');
    }
  }

}
