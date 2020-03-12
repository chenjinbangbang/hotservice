import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) { }

  findAll() {
    return this.userRepo.find();
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
