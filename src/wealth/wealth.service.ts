import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wealth } from 'src/entity/wealth.entity';
import { resFormat, searchParams } from 'src/common/global';

@Injectable()
export class WealthService {
  constructor(@InjectRepository(Wealth) private readonly wealthRepo: Repository<Wealth>) { }

  // 获取当前用户的财务明细列表
  async getList(user, data) {
    console.log(data);
    // let searchData: object = searchParams(data, [], ['page', 'pageNum', 'time']);

    let sql = this.wealthRepo.createQueryBuilder('wealth')
      .where('user_id = :id', { id: user.id });

    if (data.time && data.time.length === 2) {
      sql.andWhere('time between :timt1 and :time2', { time1: data.time[0], time2: data.time[1] });
    }

    let res: any = await sql
      .skip((data.page - 1) * data.pageNum)
      .take(data.pageNum)
      .getMany();

    let count: number = await sql.getCount();

    return resFormat(true, { lists: res, total: count }, null);
  }

  // 添加一条财务明细记录
  async wealthCreate(data) {
    let wealth = await this.wealthRepo.create(data);
    await this.wealthRepo.save(wealth);

    return true;
  }
}
