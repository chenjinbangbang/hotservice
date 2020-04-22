import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { UserDtoList } from './dto/user.dto';
import { removeRawMany, removeRawOne, resFormat, searchParams } from 'src/common/global';
import { WealthService } from 'src/wealth/wealth.service';
import { DepositService } from 'src/deposit/deposit.service';

// 加密crypto
import crypto = require('crypto');


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly wealthService: WealthService,
    private readonly depositService: DepositService
  ) { }

  // 用户登录
  async login(username: string, password: string): Promise<User | undefined> {
    return this.userRepo.findOne({ username, password });
  }

  // 根据uid查询推荐人
  async findReferrer(uid) {
    let res = await this.userRepo.findOne(uid);
    // console.log(res);
    if (res) {
      return resFormat(true, res.username, null);
    } else {
      return resFormat(false, null, '推荐人不存在');
    }

    // let res = await this.userRepo.findOne(referrer_user_id)
  }

  // 获取用户列表（后台管理）
  async getList(data) {
    console.log(data);
    let searchData: object = searchParams(data, ['search', 'role', 'freeze_status', 'isVip', 'real_status'], ['page', 'pageNum', 'create_time', 'last_login_time']);

    console.log(searchData);

    // let builder = this.userRepo.createQueryBuilder('u');

    // return this.userRepo.find();
    try {

      let sql = this.userRepo.createQueryBuilder('user')
        .select(['user.*', 'u.username referrer_username', '(select count(*) from user where u.id = referrer_user_id) referrer_num', '(select count(*) from platform where status = 2 and user.id = user_id) platformStatusNum'])
        .leftJoinAndSelect(User, 'u', 'user.referrer_user_id = u.id')
        .where('(user.id like :search or user.username like :search or user.email like :search or user.qq like :search or user.mobile like :search or user.freeze_reason like :search or user.name like :search or user.idcardno like :search)')
        .andWhere('user.role like :role and user.freeze_status like :freeze_status and user.isVip like :isVip and user.real_status like :real_status');

      if (data.create_time && data.create_time.length === 2) {
        sql.andWhere('user.create_time between :create_time1 and :create_time2', { create_time1: data.create_time[0], create_time2: data.create_time[1] });
      }

      if (data.last_login_time && data.last_login_time.length === 2) {
        sql.andWhere('user.last_login_time between :last_login_time1 and :last_login_time2', { create_time1: data.last_login_time[0], create_time2: data.last_login_time[1] });
      }

      let res: any = await sql
        .offset((data.page - 1) * data.pageNum)
        .limit(data.pageNum)
        .setParameters(searchData)
        .getRawMany();

      // 使用getRawMany()方法时，删除所有原始数据，并且不可返回password和password_security
      removeRawMany(res, 'u_', ['password', 'password_security']);

      // 处理是否绑定了平台账号，platformStatusNum大于0，则isPlatform为true，否则为false
      res.forEach(item => {
        item.isPlatform = Number(item.platformStatusNum) > 0;
        delete item.platformStatusNum;
      });

      // 查询总数
      let count = await sql.getCount();

      // return { success: true, data: { lists: res, total: count }, msg: null };
      return resFormat(true, { lists: res, total: count }, null);
    } catch (err) {
      console.log(err);
      return resFormat(false, null, err);
    }
  }

  // 获取某个用户的信息
  async userInfo(user) {
    let { id } = user

    // return this.userRepo.find();
    try {
      let res = await this.userRepo.createQueryBuilder('user')
        .select(['user.*', 'u.username referrer_username', '(select count(*) from user where u.id = referrer_user_id) referrer_num', '(select count(*) from platform where status = 2 and user.id = user_id) platformStatusNum'])
        .leftJoinAndSelect(User, 'u', 'user.referrer_user_id = u.id')
        .where('user.id = :id', { id })
        .getRawOne();

      // 使用getRawOne()方法时，删除所有原始数据，并且不可返回password和password_security
      removeRawOne(res, 'u_', ['password', 'password_security']);

      res.isPlatform = Number(res.platformStatusNum) > 0;
      delete res.platformStatusNum;

      return resFormat(true, res, null);
    } catch (err) {
      console.log(err);
      return resFormat(false, null, err);
    }
  }

  // 更改实名状态/审核状态
  async identityStatus(data) {

    // 只能传2,3
    if (![2, 3].includes(data.real_status)) {
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

  // 检查QQ是否存在
  async checkQQ(qq) {
    let res = await this.userRepo.findOne({ qq });
    if (!res) {
      return resFormat(true, null, '该QQ号不存在，可注册');
    } else {
      return resFormat(false, null, '该QQ号已存在，不可注册');
    }
  }

  // 检查手机号码是否存在
  async checkMobile(mobile) {
    let res = await this.userRepo.findOne({ mobile });
    if (!res) {
      return resFormat(true, null, '该手机号码不存在，可注册');
    } else {
      return resFormat(false, null, '该手机号码已存在，不可注册');
    }
  }

  // 购买金币
  async goldBuy(user, data) {
    const { id, wealth } = user;
    const { gold } = data;

    // 购买金币数不能大于现金余额
    if (wealth < gold) {
      return resFormat(false, null, '现金余额不足，请充值');
    }

    let res = await this.userRepo.query(`update user set gold = concat(gold + ${gold}), wealth = concat(wealth - ${gold}) where id = ${id}`);
    console.log(res);

    // return res;
    if (res.affectedRows > 0) {

      // 添加一条财务明细记录
      let userInfo = await this.userRepo.findOne(id);
      let wealthData = {
        user_id: id,
        type: 0,
        detail: `购买${gold}个金币，从现金余额扣除${gold}元`,
        change_gold_type: 1,
        change_gold: gold,
        gold: userInfo.gold,
        change_wealth_type: 0,
        change_wealth: gold,
        wealth: userInfo.wealth
      }
      await this.wealthService.wealthCreate(wealthData);

      return resFormat(true, null, '购买金币成功');
    } else {
      return resFormat(false, null, '购买金币失败');
    }
  }

  // 用户充值（payService调用）
  async reCharge(user, wealth) {
    let res = await this.userRepo.query(`update user set wealth = concat(wealth + ${wealth}) where id = ${user.id}`);
    if (res.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  }

  // 金币兑现
  async goldCash(user, data) {
    let { id } = user;
    let { gold, password_security } = data;

    password_security = crypto.createHmac('sha256', password_security).update('hot').digest('hex');

    // 输入安全密码是否正确
    let password_securityCheck = await this.userRepo.findOne({ id, password_security })
    console.log(password_securityCheck)
    if (!password_securityCheck) {
      return resFormat(false, null, '输入安全密码不正确');
    }

    let wealth = (user.isVip === 1 ? 0.9 : 0.8) * gold;
    let res = await this.userRepo.query(`update user set gold = concat(gold - ${gold}), wealth = concat(wealth + ${wealth}) where id = ${id} and password_security = '${password_security}'`);
    if (res.affectedRows > 0) {

      // 添加一条财务明细记录
      let userInfo = await this.userRepo.findOne(id);
      let wealthData = {
        user_id: id,
        type: 1,
        detail: `扣除${gold}个金币，兑换现金${wealth}元`,
        change_gold_type: 0,
        change_gold: gold,
        gold: userInfo.gold,
        change_wealth_type: 1,
        change_wealth: wealth,
        wealth: userInfo.wealth
      }
      await this.wealthService.wealthCreate(wealthData);

      return resFormat(true, null, '金币兑换成功');
    } else {
      return resFormat(false, null, '金币兑换失败');
    }
  }

  // 现金提现
  async wealthDeposit(user, data) {
    let { id } = user;
    let { wealth, bank_id, password_security } = data;

    password_security = crypto.createHmac('sha256', password_security).update('hot').digest('hex');

    // 输入安全密码是否正确
    let password_securityCheck = await this.userRepo.findOne({ id, password_security })
    console.log(password_securityCheck)
    if (!password_securityCheck) {
      return resFormat(false, null, '输入安全密码不正确');
    }

    // 增加一条提现记录（现金提现调用）
    let despoitData = {
      user_id: id,
      bank_id,
      wealth
    };
    let res = await this.depositService.createDeposit(despoitData);
    if (res) {
      return resFormat(true, null, '已提现，待到账（到账时间以各个银行提现速度为准）');
    } else {
      return resFormat(false, null, '现金提现失败');
    }
  }

  // 修改用户头像
  async portraitAlter(user, data) {
    const { id } = user;

    let res = await this.userRepo.update(id, data);
    console.log(res);

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '修改用户头像成功');
    } else {
      return resFormat(false, null, '修改用户头像失败');
    }
  }

  // 修改登录密码
  async passwordAlter(user, data) {
    const { id } = user;
    let { password, new_password, new_password_confirm } = data;

    // 原登录密码不能和新登录密码相同
    if (password === new_password) {
      ;
      return resFormat(false, null, '原登录密码不能和新登录密码相同');
    }

    // 新登录密码和确认新登录密码不一致
    if (new_password !== new_password_confirm) {
      return resFormat(false, null, '新登录密码和确认新登录密码不一致');
    }

    // 密码加密
    password = crypto.createHmac('sha256', password).update('hot').digest('hex');
    new_password = crypto.createHmac('sha256', new_password).update('hot').digest('hex');
    new_password_confirm = crypto.createHmac('sha256', new_password_confirm).update('hot').digest('hex');

    let checkPassword = await this.userRepo.findOne({ id, password });
    if (!checkPassword) {
      return resFormat(false, null, '输入原登录密码不正确');
    }

    let checkPasswordSecurity = await this.userRepo.findOne({ id, password_security: new_password });
    if (!checkPasswordSecurity) {
      return resFormat(false, null, '新登录密码不能和安全密码相同');
    }

    let res = await this.userRepo.update(id, { password: new_password });

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '修改登录密码成功');
    } else {
      return resFormat(false, null, '修改登录密码失败');
    }
  }

  // 修改安全密码
  async passwordSecurityAlter(user, data) {
    const { id } = user;
    let { password_security, new_password_security, new_password_security_confirm } = data;

    // 原安全密码不能和新安全密码相同
    if (password_security === new_password_security) {
      return resFormat(false, null, '原安全密码不能和新安全密码相同');
    }

    // 新安全密码和确认新安全密码不一致
    if (new_password_security !== new_password_security_confirm) {
      return resFormat(false, null, '新安全密码和确认新安全密码不一致');
    }

    // 密码加密
    password_security = crypto.createHmac('sha256', password_security).update('hot').digest('hex');
    new_password_security = crypto.createHmac('sha256', new_password_security).update('hot').digest('hex');
    new_password_security_confirm = crypto.createHmac('sha256', new_password_security_confirm).update('hot').digest('hex');

    let checkPasswordSecurity = await this.userRepo.findOne({ id, password_security });
    if (!checkPasswordSecurity) {
      return resFormat(false, null, '输入原安全密码不正确')
    }

    let checkPassword = await this.userRepo.findOne({ id, password: new_password_security });
    if (!checkPassword) {
      return resFormat(false, null, '新安全密码不能和登录密码相同');
    }

    let res = await this.userRepo.update(id, { password_security: new_password_security });

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '修改安全密码成功');
    } else {
      return resFormat(false, null, '修改安全密码失败');
    }
  }

  // 实名认证
  async identity(user, data) {
    const { id } = user;

    data.real_status = 1;

    let res = await this.userRepo.update(id, data);

    if (res.raw.affectedRows > 0) {
      return resFormat(true, null, '实名认证成功');
    } else {
      return resFormat(false, null, '实名认证失败');
    }

  }

}
