import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Auth } from './auth.entity';
// import { Repository } from 'typeorm';

// jwt签发
import { JwtService } from '@nestjs/jwt'; // 不要忘记将jwtService提供者注入到AuthService
import { jwtConstants } from './constants';
import { UserService } from 'src/user/user.service';
import { resFormat } from 'src/common/global';
import { User } from 'src/entity/user.entity';

// 加密crypto
import crypto = require('crypto');
import { Repository } from 'typeorm';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) { }

  // 验证用户，先在数据查找该用户， 然后把result放到token信息里面，在local.strategy.ts执行
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.login(username, pass);

    if (user) {
      // 更新登录时间
      await this.userRepo.update(user.id, { last_login_time: new Date() })

      return user;
    }
    return null;
  }

  // 用户登录，登录方法，在auth.controller.ts执行，把需要的用户信息存到token里面
  async login(user: any) {
    const { username, id, isVip, gold, wealth, role } = user;
    const payload = { username, sub: id, isVip, gold, wealth, role }; // sub属性：保持我们的id值与JWT标准一致
    console.log('token信息：', payload);
    return {
      access_token: this.jwtService.sign(payload), // sign()函数：用于从用户对象属性的子集生产jwt
      expiresIn: jwtConstants.expiresIn * 1000
    }
  }

  // 用户注册
  async register(data) {
    let { username, email, qq, mobile, password, password_confirm, password_security, password_security_confirm } = data;

    // 检查用户名是否存在
    const checkUsername = await this.userService.checkUsername(username);
    console.log(checkUsername);
    if (!checkUsername.success) {
      return checkUsername;
    }

    // 检查邮箱是否存在
    const checkEmail = await this.userService.checkEmail(email);
    console.log(checkEmail);
    if (!checkEmail.success) {
      return checkEmail;
    }

    // 检查QQ号是否存在
    const checkQQ = await this.userService.checkQQ(qq);
    console.log(checkQQ);
    if (!checkQQ.success) {
      return checkQQ;
    }

    // 检查手机号码是否存在
    const checkMobile = await this.userService.checkMobile(mobile);
    console.log(checkMobile);
    if (!checkMobile.success) {
      return checkMobile;
    }

    // 密码和确认密码不一致
    if (password !== password_confirm) {
      return resFormat(false, null, '密码和确认密码不一致')
    }

    // 安全密码不能和密码相同
    if (password === password_security) {
      return resFormat(false, null, '安全密码不能和密码相同')
    }

    // 安全密码和确认安全密码不一致
    if (password_security !== password_security_confirm) {
      return resFormat(false, null, '安全密码和确认安全密码不一致')
    }

    // 密码加密
    password = crypto.createHmac('sha256', password).update('hot').digest('hex');
    password_confirm = crypto.createHmac('sha256', password_confirm).update('hot').digest('hex');
    password_security = crypto.createHmac('sha256', password_security).update('hot').digest('hex');
    password_security_confirm = crypto.createHmac('sha256', password_security_confirm).update('hot').digest('hex');

    // 新增用户
    let user = this.userRepo.create(data);
    let res = await this.userRepo.save(user);

    console.log(res);
    // 用户登录
    let loginRes = await this.login(res);

    return resFormat(true, loginRes, '注册成功');
  }


  // constructor(@InjectRepository(Auth) private readonly authRepository: Repository<Auth>) { }

  // 验证用户名是否存在
  // async checkUsername(param) {
  //   // let sql = `select * from user where username = '${param}'`;
  //   // let data = await db(sql);

  //   return param
  // }

  // // 查询所有数据
  // findAll() {
  //   return this.authRepository.find(); // find()方法查询所有数据
  // }

  // // 按条件查询数据
  // find(name: string) {
  //   // return this.authRepository.find({ name }) // find()方法加上查询对象参数，即可查询符合条件的数据

  //   // query查询
  //   return this.authRepository.createQueryBuilder('a') // auth为表名
  //     // .leftJoinAndSelect('auth.roles', 'r') // 指定join auth的roles关联属性，并指定别名为r，并设定搜寻条件
  //     .where('name like :name', { name: `%${name}%` }) // where条件
  //     // .andWhere('')
  //     .orderBy('age', 'DESC') // DESC降序排序，ASC升序
  //     // .addOrderBy('age', 'DESC')
  //     .skip(0) // 分页-从哪行数据开始
  //     .take(2) // 分页-一页的条数
  //     .getManyAndCount(); // 回传record并count数量
  //   // .getMany(); // 回传多笔资料
  //   // .getSql() // 回传上面API所组出的Raw SQL，debug用
  // }

  // // 根据某个字段查询数据
  // async getAuthById(id) {
  //   // return await this.authRepository.findOne(id); // 以id搜寻，没找到return null
  //   return await this.authRepository.findOneOrFail(id); // 以id搜寻，没找到会丢出例外
  // }

  // // 新增数据
  // async create(data) {
  //   const authData = new Auth;
  //   authData.name = data.name;
  //   authData.age = data.age;
  //   authData.sex = data.sex;
  //   await this.authRepository.save(authData);
  //   return '新增数据成功';
  // }

  // // 更新数据
  // async update(data) {
  //   await this.authRepository.update(data.id, data); // 用data里的值更新到资料库
  //   return '更新数据成功';
  // }

  // // 删除数据
  // async delete(id) {
  //   await this.authRepository.delete(id); // delete之需要传入id
  //   return '删除数据成功'
  // }
}
