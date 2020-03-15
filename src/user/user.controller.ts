import { Controller, Get, Body, Put, ForbiddenException, Res, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entity/user.entity';
import { UserDtoList } from './dto/user.dto';
import { ApiTags, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

// 获取用户列表 - 实体
class UserDto {
  @ApiProperty({
    description: '当前页',
    default: 1
  })
  @IsInt()
  readonly page: number;

  @ApiProperty({
    description: '一页的条数',
    default: 10
  })
  @IsInt()
  readonly pageNum: number;

  @ApiProperty({
    description: '模糊搜索：编号(id)，用户名(username)，师傅(referrer_username)，E-mail(email)，QQ(qq)，手机号(mobile)，冻结原因(freeze_reason)，真实姓名(name)，身份证号码(idcardno)'
  })
  @IsString()
  readonly search: string;
}

@ApiTags('用户相关') // 要将控制器附加到特定标签
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // 获取用户列表
  @Post('list')
  @ApiBody({ type: UserDto })
  @ApiResponse({ type: [UserDtoList] }) // 响应的模型
  findAll(@Body() body: UserDto) {
    return this.userService.findAll(body);
  }

  @Put()
  // @ApiBody({ type: [UserDto] }) // 
  async update(@Body() body: UserDto) {
    console.log(body)
    await this.userService.update(body);

  }

}
