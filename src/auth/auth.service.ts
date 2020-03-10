import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { Repository } from 'typeorm';


@Injectable()
export class AuthService {
  constructor(@InjectRepository(Auth) private readonly authRepository: Repository<Auth>) { }

  // 验证用户名是否存在
  async checkUsername(param) {
    // let sql = `select * from user where username = '${param}'`;
    // let data = await db(sql);

    return param
  }

  // 查询所有数据
  findAll() {
    return this.authRepository.find(); // find()方法查询所有数据
  }

  // 按条件查询数据
  find(name: string): Promise<Auth[]> {
    return this.authRepository.find({ name }) // find()方法加上查询对象参数，即可查询符合条件的数据
  }

  // 新增数据
  async create(data) {
    const authData = new Auth;
    authData.name = data.name;
    authData.age = data.age;
    authData.isActive = data.isActive;
    console.log(authData);
    return await this.authRepository.save(authData);
  }
}
