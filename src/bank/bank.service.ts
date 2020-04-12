import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Bank } from 'src/entity/bank.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { resFormat, removeRawMany } from 'src/common/global';
import { BasicService } from 'src/basic/basic.service';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank) private readonly bankRepo: Repository<Bank>,
    private readonly basicService: BasicService
  ) { }

  // 查询某个银行卡是否存在
  // async findOne(id) {
  //   let res = await this.bankRepo.findOne(id);

  //   if (!res) {
  //     return resFormat(true, '查不到该银行卡', null);
  //   } else {
  //     return res;
  //   }
  // }

  // 获取当前用户的银行卡列表
  async getListById(user) {
    let res: any[] = await this.bankRepo.find({ user_id: user.id });

    // 处理响应数据
    let promises: any[] = [];
    res.forEach(item => {
      let p = new Promise(async resolve => {
        // 银行卡号4-14位做脱敏处理
        item.bank_num = item.bank_num.replace(item.bank_num.substring(4, 16), '******');

        // 获取省市区字符串
        let region = await this.basicService.getAreaRegion({ provinceId: item.bank_province, cityId: item.bank_city, districtId: item.bank_area });

        // delete item.bank_province;
        // delete item.bank_city;
        // delete item.bank_area;
        item.region = region.data;

        resolve(item);
      })

      promises.push(p);
    })
    // console.log(promises);

    let newRes = await Promise.all(promises);

    let count = await this.bankRepo.count({ user_id: user.id });

    return resFormat(true, { lists: newRes, total: count }, null);
  }


  // 获取某个银行卡的信息
  async getDetail(data) {
    let res: any = await this.bankRepo.findOne({ id: data.id });

    // 获取省市区字符串
    const region = await this.basicService.getAreaRegion({ provinceId: res.bank_province, cityId: res.bank_city, districtId: res.bank_area });
    res.region = region.data;

    if (res) {
      return resFormat(true, res, null);
    } else {
      return resFormat(false, '查不到该银行卡', null);
    }
  }

  // 添加银行卡
  async create(user, data) {
    let count = await this.bankRepo.count({ user_id: user.id });
    console.log('当前用户的银行卡数量：', count)
    if (count >= 3) {
      return resFormat(false, null, '最多只能添加3张银行卡');
    }

    data.user_id = user.id; // 添加user_id

    let bank = await this.bankRepo.create(data);
    let res = await this.bankRepo.save(bank);

    return resFormat(true, null, '添加银行卡成功');
  }

  // 修改银行卡
  async alter(data) {
    let isExist = await this.bankRepo.findOne(data.id);
    if (!isExist) {
      return resFormat(true, '查不到该银行卡', null);
    }

    let res = await this.bankRepo.update(data.id, data);
    console.log(res);

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '修改银行卡成功');
    } else {
      return resFormat(false, null, '修改银行卡失败');
    }
  }

  // 删除银行卡
  async delete(data) {
    let isExist = await this.bankRepo.findOne(data.id);
    if (!isExist) {
      return resFormat(true, '查不到该银行卡', null);
    }

    let res = await this.bankRepo.delete(data.id);
    console.log(res);

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '删除银行卡成功');
    } else {
      return resFormat(false, null, '删除银行卡失败');
    }
  }

  // 获取银行卡列表（后台管理）
  async getList(data) {
    console.log(data);

    let searchData: any = {};
    for (let key in data) {
      if (!['page', 'pageNum', 'create_time'].includes(key)) {
        searchData[key] = `%${data[key]}%`;
      }
    }
    console.log(searchData)

    let sql = this.bankRepo.createQueryBuilder('bank')
      .select(['bank.*', 'u.username username'])
      .leftJoinAndSelect(User, 'u', 'bank.user_id = u.id')
      .where('(u.username like :search or bank.name like :search or bank.bank_num like :search)')
      .andWhere('bank.status like :status and bank.reason like :reason');

    if (data.create_time) {
      sql.andWhere('bank.create_time between :create_time1 and :create_time2', { create_time1: data.create_time[0], create_time2: data.create_time[1] });
    }

    let res: any = await sql
      .offset((data.page - 1) * data.pageNum)
      .limit(data.pageNum)
      .setParameters(searchData)
      .getRawMany();
    // .getSql();
    // return res

    // 使用getRawMany()方法时，删除所有原始数据
    removeRawMany(res, 'u_');

    // 处理响应数据
    let promises: any[] = [];
    res.forEach(item => {
      let p = new Promise(async resolve => {

        // 获取省市区字符串
        let region = await this.basicService.getAreaRegion({ provinceId: item.bank_province, cityId: item.bank_city, districtId: item.bank_area });

        // delete item.bank_province;
        // delete item.bank_city;
        // delete item.bank_area;
        item.region = region.data;

        resolve(item);
      })

      promises.push(p);
    })
    // console.log(promises);

    let newRes = await Promise.all(promises);

    let count = await this.bankRepo.count();

    return resFormat(true, { lists: newRes, total: count }, null);
  }


  // 银行卡审核状态是否通过（后台管理）
  async checkStatus(data) {
    const { id, status, reason } = data
    let isExist = await this.bankRepo.findOne(id);
    if (!isExist) {
      return resFormat(true, '查不到该银行卡', null);
    }

    if (![1, 2].includes(status)) {
      return resFormat(true, '银行卡状态参数异常', null);
    }

    // 若审核状态为1，则审核不通过原因必传
    if (status === 1 && !reason) {
      return resFormat(true, '审核状态为1时，审核不通过原因必传', null);
    }

    let res = await this.bankRepo.update(id, data);

    if (res.raw.affectedRows > 0) {
      if (status === 2) {
        return resFormat(true, null, '银行卡审核已通过');
      } else if (status === 1) {
        return resFormat(true, null, '银行卡审核未通过');
      }
    } else {
      return resFormat(false, null, '修改银行卡审核状态失败');
    }
  }

}
