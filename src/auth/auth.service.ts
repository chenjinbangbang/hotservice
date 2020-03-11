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
  find(name: string) {
    return this.authRepository.find({ name }) // find()方法加上查询对象参数，即可查询符合条件的数据
  }

  // 根据某个字段查询数据
  async getAuthById(id) {
    // return await this.authRepository.findOne(id); // 以id搜寻，没找到return null
    return await this.authRepository.findOneOrFail(id); // 以id搜寻，没找到会丢出例外
  }

  // 新增数据
  async create(data) {
    const authData = new Auth;
    authData.name = data.name;
    authData.age = data.age;
    authData.sex = data.sex;
    await this.authRepository.save(authData);
    return '新增数据成功';
  }

  // 更新数据
  async update(data) {
    await this.authRepository.update(data.id, data); // 用data里的值更新到资料库
    return '更新数据成功';
  }

  // 删除数据
  async delete(id) {
    await this.authRepository.delete(id); // delete之需要传入id
    return '删除数据成功'
  }
}
