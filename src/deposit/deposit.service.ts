import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Deposit } from 'src/entity/deposit.entity';
import { Repository, getConnection, getManager, EntityManager } from 'typeorm';
import { resFormat, searchParams, removeRawMany, removeRawOne } from 'src/common/global';
import { User } from 'src/entity/user.entity';
import { Bank } from 'src/entity/bank.entity';
import { WealthService } from 'src/wealth/wealth.service';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit) private readonly depositRepo: Repository<Deposit>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly wealthService: WealthService
  ) { }

  // 获取当前用户的提现记录列表
  async getListById(user, data) {
    const { id } = user;
    const { page, pageNum } = data;

    let res: any = await this.depositRepo.createQueryBuilder('deposit')
      .select(['deposit.*', 'u.username username'])
      .leftJoinAndSelect(User, 'u', 'deposit.user_id = u.id')
      .skip((page - 1) * pageNum)
      .take(pageNum)
      .getRawMany();

    // 使用getRawMany()方法时，删除所有原始数据
    removeRawMany(res, 'u_');

    let count: number = await this.depositRepo.count({ user_id: id });

    return resFormat(true, { lists: res, total: count }, null);
  }

  // 获取提现记录列表（后台管理）
  async getList(data) {
    console.log(data);
    let searchData: any = searchParams(data, ['search', 'status'], ['page', 'pageNum', 'create_time']);

    let sql = this.depositRepo.createQueryBuilder('deposit')
      .select(['deposit.*', 'u.username username'])
      .leftJoinAndSelect(User, 'u', 'deposit.user_id = u.id')
      .leftJoinAndSelect(Bank, 'b', 'deposit.bank_id = b.id')
      .where('(u.username like :search or b.bank_num like :search)')
      .andWhere('deposit.status like :status');

    if (data.create_time && data.create_time.length === 2) {
      sql.andWhere('deposit.create_time between :create_time1 and :create_time2', { create_time1: data.create_time[0], create_time2: data.create_time[1] });
    }

    let res: any = await sql
      .offset((data.page - 1) * data.pageNum)
      .limit(data.pageNum)
      .setParameters(searchData)
      .getRawMany();

    // 使用getRawMany()方法时，删除所有原始数据
    removeRawMany(res, 'u_');
    removeRawMany(res, 'b_');

    let count: number = await sql.getCount();

    return resFormat(true, { lists: res, total: count }, null);
  }

  // 更改提现状态（后台管理）
  async checkStatus(data) {
    console.log(data);

    // getManager（隐式commit，隐式rollback）
    // return getManager().transaction(async (entityManager: EntityManager) => {
    //   await entityManager.update(User, { id: 100035 }, { wealth: 30 }); // 生效
    //   await entityManager.update(Deposit, { id: 1 }, { status: null }); // 报错

    //   // throw new Error('主动抛出错误');
    //   let a = '11'
    //   console.log(a[0].length);

    // }).then(res => {
    //   console.log(res);
    //   return '更新成功';
    // }).catch(e => {
    //   console.log(e);
    //   return '更新失败';
    // })

    const { id, status, reason } = data;
    let depositInfo = await this.depositRepo.findOne(id);
    if (!depositInfo) {
      return resFormat(false, '查不到该提现记录', null);
    }
    const { user_id, wealth, status: depositStatus } = depositInfo;

    // 若提现状态已经为1,2，则已更改过提现状态，不能再继续更改
    if ([1, 2].includes(depositStatus)) {
      return resFormat(false, '该提现记录已更改过提现状态，不能再继续更改', null);
    }

    // 提现状态只能传1,2
    if (![1, 2].includes(status)) {
      return resFormat(false, '提现状态参数异常', null);
    }

    // 若提现状态为2，则提现失败原因必传
    if (status === 2) {
      if (!reason) {
        return resFormat(false, '提现失败原因必传', null);
      }
    } else if (status === 1) {
      delete data.reason
    }

    // 更改提现状态
    let res = await this.depositRepo.update(id, data);

    if (res.raw.affectedRows > 0) {
      if (status === 1) {

        // 更新用户提现金额
        let resResult = await this.userRepo.query(`update user set wealth = concat(wealth - ${wealth}) where id = ${user_id}`)

        if (resResult.affectedRows > 0) {

          // 添加一条财务明细记录
          let userInfo = await this.userRepo.findOne(user_id);
          let wealthData = {
            user_id,
            type: 4,
            detail: `已提现${wealth}元到银行卡`,
            change_gold_type: 0,
            change_gold: 0,
            gold: userInfo.gold,
            change_wealth_type: 0,
            change_wealth: wealth,
            wealth: userInfo.wealth
          }
          await this.wealthService.wealthCreate(wealthData);

          return resFormat(true, null, '提现成功，已到账');
        } else {
          return resFormat(false, null, '提现成功，已到账。但是更新提现金额失败，请修复数据库的漏洞，避免资金损失');
        }
      } else if (status === 2) {
        return resFormat(true, null, '提现失败，已退回');
      }
    } else {
      return resFormat(false, null, '更改提现状态失败');
    }
  }

  // 增加一条提现记录（现金提现调用）
  async createDeposit(data) {
    let deposit = await this.depositRepo.create(data);
    await this.depositRepo.save(deposit);

    return true;
  }
}
