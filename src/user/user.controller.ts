import { Controller, Get, Body, Put, ForbiddenException, Res, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
// import { User } from 'src/entity/user.entity';
import { UserSearchDto, UserStatusDto, UserDto, EmailDto, goldBuyDto, UsernameDto, QQDto, MobileDto } from './dto/user.dto';
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

  // 获取用户列表
  @Post('list')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiBody({ type: UserSearchDto })
  @ApiResponse({ type: [UserDto] }) // 响应的模型
  userList(@Body() body: UserSearchDto) {
    return this.userService.userList(body);
  }

  // 获取某个用户的信息
  @Get('info')
  @ApiOperation({ summary: '获取某个用户的信息' })
  @ApiQuery({ name: 'id', description: '用户编号', type: 'number' })
  userInfo(@Request() req, @Query() query) {
    // console.log(req.user);
    return this.userService.userInfo(query.id);
  }

  // 更改实名状态/审核状态（需要添加一条日志）
  @Put('identity/status')
  @ApiOperation({ summary: '更改实名状态/审核状态' })
  @ApiBody({ type: UserStatusDto })
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
  goldBuy(@Request() req, @Body() body: goldBuyDto) {
    console.log(req.user);
    return this.userService.goldBuy(req.user.id, body);
  }

}
