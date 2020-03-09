import { Injectable } from '@nestjs/common';
// import db from '../modules/mysql';

@Injectable()
export class AuthService {

  // 验证用户名是否存在
  async checkUsername(param) {
    // let sql = `select * from user where username = '${param}'`;
    // let data = await db(sql);

    return param
  }
}
