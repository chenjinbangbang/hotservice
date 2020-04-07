import { Controller, Get, Body, Put, ForbiddenException, Res, Post, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
// import { User } from 'src/entity/user.entity';
import { UserSearchDto, UserStatusDto, UserDto, EmailDto, goldBuyDto } from './dto/user.dto';
import { ApiTags, ApiResponse, ApiBody, ApiProperty, ApiParam, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { IsInt, IsString, IsDate, IsArray, Min, IsEmail } from 'class-validator';

// 枚举
// enum UserRole {
//   Admin = 'Admin',
//   User = 'User'
// }

@ApiTags('用户相关') // 要将控制器附加到特定标签
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // 根据uid查询推荐人
  @ApiQuery({ name: 'uid', description: '推荐人uid' })
  @ApiOperation({ summary: '根据uid查询推荐人' })
  // @ApiResponse({ status: 200, description: 'OK' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // @ApiResponse({ status: 404, description: 'Not Found' })
  @Get('referrer_username')
  findReferrer(@Query('uid') uid) {
    console.log(uid);
    return this.userService.findReferrer(uid);
  }

  // 获取用户列表
  @Post('list')
  @ApiBody({ type: UserSearchDto })
  @ApiResponse({ type: [UserDto] }) // 响应的模型
  findAll(@Body() body: UserSearchDto) {
    return this.userService.findAll(body);
  }

  // 更改实名状态/审核状态（需要添加一条日志）
  @Put('identity/status')
  @ApiBody({ type: UserStatusDto })
  identityStatus(@Body() body: UserStatusDto) {
    console.log(body);
    return this.userService.identityStatus(body);
  }

  // 检查用户名是否存在
  @Get('check/username')
  @ApiOperation({ summary: '检查用户名是否存在' })
  @ApiQuery({ name: 'username', description: '用户名' })
  checkUsername(@Query('username') username) {
    console.log(username);
    return this.userService.checkUsername(username);
  }

  // 检查邮箱是否存在
  @Get('check/email')
  @ApiOperation({ summary: '检查邮箱是否存在' })
  @ApiQuery({ name: 'email', description: '邮箱' })
  checkEmail(@Query() query: EmailDto) { // emailDto可验证，一般用于@ApiQuery,@Apiparam
    console.log(query.email);
    return this.userService.checkEmail(query.email);
  }

  // 检查QQ是否存在
  @Get('check/qq')
  @ApiOperation({ summary: '检查QQ是否存在' })
  @ApiQuery({ name: 'qq', description: 'QQ号' })
  checkQQ(@Query('qq') qq) {
    console.log(qq);
    return this.userService.checkQQ(qq);
  }

  // 购买金币
  @Put('gold/buy')
  @ApiBody({ type: goldBuyDto })
  goldBuy(@Body() body) {
    return this.userService.boldBuy(body);
  }

}
