import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Commission } from 'src/entity/commission.entity';
import { Repository } from 'typeorm';
import { removeRawMany, resFormat } from 'src/common/global';
import { User } from 'src/entity/user.entity';
import { Platform } from 'src/entity/platform.entity';

let dateformat = require('dateformat');

@Injectable()
export class CommissionService {
  constructor(
    @InjectRepository(Commission) private readonly commissionRepo: Repository<Commission>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Platform) private readonly platformRepo: Repository<Platform>
  ) { }

  // 获取本月获取佣金和总计获取佣金数据
  async getStat(user) {
    const { id } = user;

    // 总计获取佣金
    let total: any = await this.commissionRepo.createQueryBuilder('c')
      .select('sum(gold)', 'gold')
      .where('user_id = :id', { id })
      .getRawOne();


    // 本月获取佣金
    let date = new Date();

    // 获取当月第一天的时间，如2020-04-01
    date.setDate(1);
    let startDate = dateformat(date, 'yyyy-mm-dd');
    console.log(startDate);

    // 获取下个月的第一天的时间，如2020-05-01
    date.setMonth(new Date().getMonth() + 1);
    let endDate = dateformat(date, 'yyyy-mm-dd');
    console.log(endDate);

    let month: any = await this.commissionRepo.createQueryBuilder('c')
      .select('sum(gold)', 'gold')
      .where('user_id = :id and time between :startDate and :endDate', { id, startDate, endDate })
      .getRawOne();

    return resFormat(true, { monthNum: month.gold, totalNUm: total.gold }, null);
  }

  // 获取佣金记录列表
  async getList(user, data) {
    const { id } = user;
    const { page, pageNum } = data;

    let res: any = await this.commissionRepo.createQueryBuilder('c')
      .select(['c.*', 'u.username referral_username'])
      .leftJoinAndSelect(User, 'u', 'c.user_id = u.id')
      .where('user_id = :id', { id })
      .offset((page - 1) * pageNum)
      .limit(pageNum)
      .getRawMany();

    // 使用getRawMany()方法时，删除所有原始数据
    removeRawMany(res, 'u_');

    let count: number = await this.commissionRepo.count({ user_id: id })

    return resFormat(true, { lists: res, total: count }, null);
  }

  // 获取推广记录列表
  async getGeneralizeList(user, data) {
    const { id } = user;
    const { page, pageNum } = data;

    let res: any = await this.userRepo.createQueryBuilder('u')
      .select(['u.*', '(select count(*) from platform where status = 2 and u.id = user_id) platformStatusNum'])
      .leftJoin(Platform, 'p', 'p.user_id = u.id')
      .where('u.referrer_user_id = :id', { id })
      .groupBy('u.id')
      .skip((page - 1) * pageNum)
      .take(pageNum)
      .getRawMany();

    // 使用getRawMany()方法时，删除所有原始数据，并且不可返回password和password_security
    removeRawMany(res, 'p_', ['password', 'password_security']);

    // 处理是否绑定了平台账号，platformStatusNum大于0，则isPlatform为true，否则为false
    res.forEach(item => {
      item.isPlatform = Number(item.platformStatusNum) > 0;
      delete item.platformStatusNum;
    });

    let count: number = await this.userRepo.count({ referrer_user_id: id });

    return resFormat(true, { lists: res, total: count }, null);
  }
}
