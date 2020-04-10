import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Pay } from 'src/entity/pay.entity';
import { Repository } from 'typeorm';
import { resFormat } from 'src/common/global';
// import { User } from 'src/entity/user.entity';

@Injectable()
export class PayService {
  constructor(@InjectRepository(Pay) private readonly payRepo: Repository<Pay>) { }

  // 获取充值记录
  async getList(data) {
    let { page, pageNum } = data;

    let res = await this.payRepo.createQueryBuilder('pay')
      .leftJoinAndSelect('pay.user', 'user')
      .skip((page - 1) * pageNum)
      .take(pageNum)
      .getMany();

    // 查询总数
    let count = await this.payRepo.count();

    return resFormat(true, { lists: res, total: count }, null);
  }

  // 用户充值
  async reCharge(data) {
    let pay = this.payRepo.create(data);
    let res = await this.payRepo.save(pay);
    console.log(res);

    return resFormat(true, null, '充值成功');
  }

  // 充值审核
  async payStatus(data) {

    // 只能输入0,1,2
    if (![0, 1, 2].includes(data.status)) {
      return resFormat(false, null, '充值状态参数异常');
    }

    let isExist = await this.payRepo.findOne(data.id);
    if (!isExist) {
      return resFormat(false, null, '该充值记录不存在');
    }

    let res = await this.payRepo.update(data.id, data);
    console.log(res);

    // return res;
    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '充值审核状态更改成功');
    } else {
      return resFormat(false, null, '充值审核状态更改失败');
    }
  }
}
