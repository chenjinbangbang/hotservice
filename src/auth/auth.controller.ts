import { Controller, Get, UseGuards, Post, Request, Headers, Head, Header, Query, Body } from '@nestjs/common';
import { ApiTags, ApiProperty, ApiBody, ApiHeader, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service'
import { loginDto, registerDto } from './dto/auth.dto';

// jwt
import { AuthGuard } from '@nestjs/passport';

// 加密crypto
import crypto = require('crypto');

@ApiTags('登录注册相关')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // 应用内置的守卫来启动护照本地流
  // 用户登录
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @UseGuards(AuthGuard('local'))
  @ApiBody({ type: loginDto })
  login(@Request() req) {
    console.log(req.user);
    return this.authService.login(req.user);
  }

  // 用户注册
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  register(@Body() body: registerDto) {
    // console.log(body);
    return this.authService.register(body);
  }

  // 获取当前登录的个人信息（id，username）
  @Get('profile')
  @ApiOperation({ summary: '获取当前登录的个人信息' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getProfile(@Request() req, @Headers() headers) {
    console.log(req.user);
    console.log(headers);
    return req.user;
  }

  // sha256加密
  @Get('sha256')
  @ApiOperation({ summary: 'sha256加密' })
  @ApiQuery({ name: 'str', description: '需要加密的字符串' })
  getSha256(@Query() query) {
    // 加密crypto
    const hash = crypto.createHmac('sha256', query.str).update('hot').digest('hex');
    return hash;
  }
}
