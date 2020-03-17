import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
// import { UserDtoList } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) { }


  // 获取用户列表
  findAll(data) {
    console.log(data);

    let searchData: any = {};
    for (let key in data) {
      if (!['page', 'pageNum', 'create_time', 'last_login_time'].includes(key)) {
        searchData[key] = `%${data[key]}%`;
      }
    }
    console.log(searchData)

    // let builder = this.userRepo.createQueryBuilder('u');

    // return this.userRepo.find();
    return this.userRepo.createQueryBuilder('u')
      .select(['u.id', 'u.username', 'u.password'])
      .leftJoinAndSelect("user", 'user', 'user.referrer_user_id = u.id')
      .where('(id like :search or username like :search or email like :search or qq like :search or mobile like :search or freeze_reason like :search or name like :search or idcardno like :search)')
      .andWhere('role like :role and freeze_status like :freeze_status and isVip like :isVip and real_status like :real_status')
      .where(data.create_time ? 'and create_time between :create_time1 and :create_time2' : '', { create_time1: data.create_time ? data.create_time[0] : '', create_time2: data.create_time ? data.create_time[1] : '' })
      .where(data.last_login_time ? 'and last_login_time between :last_login_time1 and :last_login_time2' : '', { last_login_time1: data.last_login_time ? data.last_login_time[0] : '', last_login_time2: data.last_login_time ? data.last_login_time[1] : '' })
      .skip((data.page - 1) * data.pageNum)
      .take(data.pageNum)
      .setParameters(searchData)
      // .getMany();
      // .getManyAndCount();
      .getOne();

    // return getManager().query('select * from user');


  }

  async update(data) {
    let result = await this.userRepo.update(data.id, data);
    console.log(result);

    return result;
    // if (result[0].affectedRows > 0) {
    //   return { success: true, msg: '更新数据成功', data: null };
    // } else {
    //   return { success: false, msg: '更新数据失败', data: null };
    // }

  }

}
