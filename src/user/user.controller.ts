import { Controller, Get, Body, Put, ForbiddenException, Res, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
// import { User } from 'src/entity/user.entity';
import { UserSearchDto, UserStatusDto, UserDto, EmailDto, GoldBuyDto, UsernameDto, QQDto, MobileDto, GoldCashDto, WealthDepositDto, PortraitAlterDto, PasswordAlterDto, PasswordSecurityAlterDto, IdentityDto } from './dto/user.dto';
import { ApiTags, ApiResponse, ApiBody, ApiProperty, ApiParam, ApiQuery, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsInt, IsString, IsDate, IsArray, Min, IsEmail } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';

// 枚举
// enum UserRole {
//   Admin = 'Admin',
//   User = 'User'
// }

@ApiTags('用户相关') // 要将控制器附加到特定标签
// @UseGuards(AuthGuard('jwt'))
// @ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // 根据uid查询推荐人
  @Get('referrer_username')
  @ApiOperation({ summary: '根据uid查询推荐人' })
  @ApiQuery({ name: 'uid', description: '推荐人uid' })
  // @ApiResponse({ status: 200, description: 'OK' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // @ApiResponse({ status: 404, description: 'Not Found' })
  findReferrer(@Query('uid') uid) {
    console.log(uid);
    return this.userService.findReferrer(uid);
  }

  // 获取用户列表（后台管理）
  @Post('list')
  @ApiOperation({ summary: '获取用户列表（后台管理）' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiBody({ type: UserSearchDto })
  @ApiResponse({ type: [UserDto] }) // 响应的模型
  getList(@Body() body: UserSearchDto) {
    return this.userService.getList(body);
  }

  // 获取某个用户的信息
  @Get('info')
  @ApiOperation({ summary: '获取某个用户的信息' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  userInfo(@Request() req) {
    // console.log(req.user);
    return this.userService.userInfo(req.user);
  }

  // 更改实名状态/审核状态
  @Put('identity/status')
  @ApiOperation({ summary: '更改实名状态/审核状态' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  identityStatus(@Body() body: UserStatusDto) {
    console.log(body);
    return this.userService.identityStatus(body);
  }

  // 检查用户名是否存在
  @Get('check/username')
  @ApiOperation({ summary: '检查用户名是否存在' })
  checkUsername(@Query() query: UsernameDto) {
    console.log(query.username);
    return this.userService.checkUsername(query.username);
  }

  // 检查邮箱是否存在
  @Get('check/email')
  @ApiOperation({ summary: '检查邮箱是否存在' })
  checkEmail(@Query() query: EmailDto) { // emailDto可验证，一般用于@ApiQuery,@Apiparam
    console.log(query.email);
    return this.userService.checkEmail(query.email);
  }

  // 检查QQ号是否存在
  @Get('check/qq')
  @ApiOperation({ summary: '检查QQ号是否存在' })
  checkQQ(@Query() query: QQDto) {
    console.log(query.qq);
    return this.userService.checkQQ(query.qq);
  }

  // 检查手机号码是否存在
  @Get('check/mobile')
  @ApiOperation({ summary: '检查手机号码是否存在' })
  checkMobile(@Query() query: MobileDto) {
    console.log(query.mobile);
    return this.userService.checkMobile(query.mobile);
  }

  // 购买金币
  @Put('gold/buy')
  @ApiOperation({ summary: '购买金币' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  goldBuy(@Request() req, @Body() body: GoldBuyDto) {
    console.log(req.user);
    return this.userService.goldBuy(req.user, body);
  }

  // 金币兑现
  @Put('gold/cash')
  @ApiOperation({ summary: '金币兑现' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  goldCash(@Request() req, @Body() body: GoldCashDto) {
    return this.userService.goldCash(req.user, body);
  }

  // 现金提现
  @Put('wealth/deposit')
  @ApiOperation({ summary: '现金提现' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  wealthDeposit(@Request() req, @Body() body: WealthDepositDto) {
    return this.userService.wealthDeposit(req.user, body);
  }

  // 修改用户头像
  @Put('portrait/alter')
  @ApiOperation({ summary: '修改用户头像' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  portraitAlter(@Request() req, @Body() body: PortraitAlterDto) {
    return this.userService.portraitAlter(req.user, body);
  }

  // 修改登录密码
  @Put('password/alter')
  @ApiOperation({ summary: '修改登录密码' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  passwordAlter(@Request() req, @Body() body: PasswordAlterDto) {
    return this.userService.passwordAlter(req.user, body);
  }

  // 修改安全密码
  @Put('password_security/alter')
  @ApiOperation({ summary: '修改安全密码' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  passwordSecurityAlter(@Request() req, @Body() body: PasswordSecurityAlterDto) {
    return this.userService.passwordSecurityAlter(req.user, body);
  }

  // 实名认证
  @Put('identity')
  @ApiOperation({ summary: '实名认证' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  identity(@Request() req, @Body() body: IdentityDto) {
    return this.userService.identity(req.user, body);
  }

}
