import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
// import { UserDtoList } from './dto/user.dto';
import { removeRawMany, resFormat } from 'src/common/global';
import { response } from 'express';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) { }

  // 根据uid查询推荐人
  async findReferrer(uid) {
    let res = await this.userRepo.findOne(uid);
    console.log(res);
    if (res) {
      return resFormat(true, res.username, null);
    } else {
      return resFormat(false, null, '推荐人不存在');
    }

    // let res = await this.userRepo.findOne(referrer_user_id)
  }


  // 获取用户列表
  async findAll(data) {
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
    try {
      let res = await this.userRepo.createQueryBuilder('user')
        // .select(['user.id', 'user.username'])
        // .where('username like :search or email like :search')

        .select(['user.*', 'u.username referrer_username'])
        .leftJoinAndSelect(User, 'u', 'user.referrer_user_id = u.id')
        .where('(user.id like :search or user.username like :search or user.email like :search or user.qq like :search or user.mobile like :search or user.freeze_reason like :search or user.name like :search or user.idcardno like :search)')
        .andWhere('user.role like :role and user.freeze_status like :freeze_status and user.isVip like :isVip and user.real_status like :real_status')
        // .where(data.create_time ? 'and user.create_time between :create_time1 and :create_time2' : '', { create_time1: data.create_time ? data.create_time[0] : '', create_time2: data.create_time ? data.create_time[1] : '' })
        // .where(data.last_login_time ? 'and user.last_login_time between :last_login_time1 and :last_login_time2' : '', { last_login_time1: data.last_login_time ? data.last_login_time[0] : '', last_login_time2: data.last_login_time ? data.last_login_time[1] : '' })
        // .skip((data.page - 1) * data.pageNum)
        // .take(data.pageNum)
        .offset((data.page - 1) * data.pageNum)
        .limit(data.pageNum)
        .setParameters(searchData)
        // .printSql()
        // .getMany();
        .getRawMany();
      // .getSql();
      // .getManyAndCount();
      // .getOne(); // 返回查询的第一条数据
      // return res;

      removeRawMany(res, 'u_', ['password', 'token']);

      // 查询总数
      let count = await this.userRepo.count();
      // console.log(count);

      // return { success: true, data: { lists: res, total: count }, msg: null };
      return resFormat(true, { lists: res, total: count }, null);
    } catch (err) {
      console.log(err);
      return resFormat(false, null, err);
    }
  }

  // 更改实名状态/审核状态
  async identityStatus(data) {

    // 只能输入0,1,2,3
    if (![0, 1, 2, 3].includes(data.real_status)) {
      return resFormat(false, null, '实名状态/审核状态参数异常');
    }

    let isExist = await this.userRepo.findOne(data.id);
    if (!isExist) {
      return resFormat(false, null, '该用户不存在');
    }

    let res = await this.userRepo.update(data.id, data);
    console.log(res);

    // return res;
    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '更改实名状态/审核状态成功');
    } else {
      return resFormat(false, null, '更改实名状态/审核状态失败');
    }
  }

  // 检查用户名是否存在
  async checkUsername(username) {
    let res = await this.userRepo.findOne({ username });
    if (!res) {
      return resFormat(true, null, '用户名可注册');
    } else {
      return resFormat(false, null, '用户名已注册');
    }
  }

  // 检查邮箱是否存在
  async checkEmail(email) {
    let res = await this.userRepo.findOne({ email });
    if (!res) {
      return resFormat(true, null, '该邮箱不存在，可注册');
    } else {
      return resFormat(false, null, '该邮箱已存在，不可注册');
    }
  }

}
