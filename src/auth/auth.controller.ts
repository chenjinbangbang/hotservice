import { Controller, Get, Param, Req, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from './auth.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // 验证用户名是否存在
  @Get('check/username/:username')
  async checkUsername(@Param('username') username: string) {
    return await this.authService.checkUsername(username);
  }

  // 查询所有数据
  @Get('list')
  findAll(): Promise<Auth[]> {
    return this.authService.findAll();
  }

  // 按条件查询数据
  @Get()
  find(@Req() req) {
    console.log(req.query.name)
    return this.authService.find(req.query.name);
  }

  // 新增数据
  @Post()
  create(@Body() body) {
    return this.authService.create(body);
  }

}
