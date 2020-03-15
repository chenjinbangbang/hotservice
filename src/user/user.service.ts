import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { UserDtoList } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) { }

  // 获取用户列表
  findAll(data) {
    // return this.userRepo.find();
    return this.userRepo.createQueryBuilder('u')
      .where('(id like :id or username like :username or email like :email or qq like :qq or mobile like :mobile)', { id: `%${data.search}%`, username: `%${data.search}%`, email: `%${data.search}%`, qq: `%${data.search}%`, mobile: `%${data.search}%` })
      // .andWhere('useranme like :useranme', { username: `%${data.search}%` })
      .skip((data.page - 1) * data.pageNum)
      .take(data.pageNum)
      .getMany();
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
