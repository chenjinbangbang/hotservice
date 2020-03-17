import { Controller, Get, Body, Put, ForbiddenException, Res, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entity/user.entity';
import { UserDtoList } from './dto/user.dto';
import { ApiTags, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDate, IsArray } from 'class-validator';

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

  // 模糊搜索：编号(id)，用户名(username)，师傅(referrer_username)，E-mail(email)，QQ(qq)，手机号(mobile)，冻结原因(freeze_reason)，真实姓名(name)，身份证号码(idcardno)
  @ApiProperty({
    // required: false,
    description: '查询关键字，模糊搜索（编号，用户名，师傅，E-mail，QQ，手机号，冻结原因，真实姓名，身份证号码）',

  })
  @IsString()
  readonly search: string;

  // 精准搜索：角色(role)，是否被冻结(freeze_status)，vip(isVip)，实名状态(real_status)，是否绑定了平台账号(isPlatform)，注册时间(create_time)，最后登录时间(last_login_time)
  @ApiProperty({
    description: '角色（""：搜索全部，0：刷手，1：创作者，2：管理者）',
    default: ''
  })
  // @IsString()
  readonly role: string;

  @ApiProperty({
    description: '是否被冻结（""：搜索全部，0：正常，1：冻结）',
    default: ''
  })
  // @IsInt()
  readonly freeze_status: string;

  @ApiProperty({
    description: 'vip（""：搜索全部，0：不是，1：是）',
    default: ''
  })
  // @IsInt()
  readonly isVip: string;

  @ApiProperty({
    description: '实名状态（""：搜索全部，0：未实名，1：待审核，2：审核不通过，3：已实名）',
    default: ''
  })
  // @IsInt()
  readonly real_status: string;

  @ApiProperty({
    description: '是否绑定了平台账号（""：搜索全部，0：否，1：是）',
    default: ''
  })
  // @IsInt()
  readonly isPlatform: string;

  @ApiProperty({
    description: '注册时间'
  })
  // @IsArray()
  readonly create_time: null | Array<any>;

  @ApiProperty({
    description: '最后登录时间'
  })
  // @IsArray()
  readonly last_login_time: null | Array<any>;
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
