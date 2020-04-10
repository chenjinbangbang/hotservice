import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Bank } from 'src/entity/bank.entity';
import { Repository } from 'typeorm';
import { resFormat } from 'src/common/global';

@Injectable()
export class BankService {
  constructor(@InjectRepository(Bank) private readonly bankRepo: Repository<Bank>) { }

  // 查询某个银行卡是否存在
  // async findOne(id) {
  //   let res = await this.bankRepo.findOne(id);

  //   if (!res) {
  //     return resFormat(true, '查不到该银行卡', null);
  //   } else {
  //     return res;
  //   }
  // }

  // 获取银行卡列表
  async getList() {
    let res = await this.bankRepo.find();

    let count = await this.bankRepo.count();

    return resFormat(true, { lists: res, total: count }, null);
  }

  // 获取某个银行卡的信息
  async getDetail(id) {
    let res = await this.bankRepo.findOne(id);

    if (res) {
      return resFormat(true, res, null);
    } else {
      return resFormat(true, '查不到该银行卡', null);
    }
  }

  // 添加银行卡
  async create(data) {

    let count = await this.bankRepo.count();
    if (count >= 3) {
      return resFormat(false, null, '最多只能添加3张银行卡');
    }

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

  // 审核是否通过（后台管理）
  async checkStatus(data) {

  }

}
