import { Controller, Get, UseGuards, Post, Request, Headers, Head, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiProperty, ApiBody, ApiHeader, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

// jwt
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service'

class userDto {
  @ApiProperty({
    description: '用户名'
  })
  readonly username: string;

  @ApiProperty({
    description: '密码'
  })
  readonly password: string;
}

@ApiTags('全局接口')
// @ApiHeader({ name: 'Authorization', description: 'token' })
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService
  ) {
    // console.log(__dirname);
    // console.log(__filename);
    // console.log(process);
    // console.log(URL);
  }

  // 测试接口是否正常
  @Get()
  getHello(): object {
    return this.appService.getHello();
  }

  // 应用内置的守卫来启动护照本地流
  @UseGuards(AuthGuard('local'))
  @ApiBody({ type: userDto })
  @Post('auth/login')
  async login(@Request() req) {
    console.log(req.user);
    return this.authService.login(req.user);
  }


  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '获取个人信息' })
  // @ApiBearerAuth()
  @ApiHeader({ name: 'authorization', description: 'token' })
  getProfile(@Request() req, @Headers() headers) {
    console.log(req.user);
    console.log(headers);
    return req.user;
  }
}
