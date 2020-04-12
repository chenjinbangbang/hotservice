import { IsString, IsInt, IsBoolean, Length, IsDate, IsDateString, IsNumber, IsEmail, Min, Matches, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from 'src/common/dto';

// 获取用户列表实体
export class UserSearchDto extends PageDto {
  // 模糊搜索：编号(id)，用户名(username)，师傅(referrer_username)，E-mail(email)，QQ(qq)，手机号(mobile)，冻结原因(freeze_reason)，真实姓名(name)，身份证号码(idcardno)
  @ApiProperty({
    // required: false,
    description: '查询关键字，模糊搜索（编号，用户名，师傅，E-mail，QQ，手机号，冻结原因，真实姓名，身份证号码）',
  })
  @IsString()
  readonly search: string;

  // 精准搜索：角色(role)，是否被冻结(freeze_status)，vip(isVip)，实名状态(real_status)，是否绑定了平台账号(isPlatform)，注册时间(create_time)，最后登录时间(last_login_time)
  // @ApiProperty({
  //   description: '角色（""：搜索全部，0：刷手，1：创作者，2：管理者）',
  //   default: ''
  // })
  // // @IsString()
  // readonly role: string;
  @ApiProperty({
    description: '角色（""：搜索全部，user：刷手，origin：创作者，admin：管理者）',
    enum: ['user', 'origin', 'admin'],
    default: ''
  })
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

  // @ApiProperty({
  //   description: '是否绑定了平台账号（""：搜索全部，0：否，1：是）',
  //   default: ''
  // })
  // // @IsInt()
  // readonly isPlatform: string;

  @ApiProperty({
    description: '注册时间',
    type: [String]
  })
  // @IsArray()
  readonly create_time: null | string[];

  @ApiProperty({
    description: '最后登录时间',
    type: [String]
  })
  // @IsArray()
  readonly last_login_time: null | string[];
}

// 更改实名状态/审核状态实体
export class UserStatusDto {
  @ApiProperty({
    description: '用户编号'
  })
  @IsInt()
  readonly id: number

  @ApiProperty({
    description: '改变的状态（0：未实名，1：待审核，2：审核不通过，3：已实名）',
    default: 0
  })
  @IsInt()
  readonly real_status: number
}

// 验证用户名实体
export class UsernameDto {
  @ApiProperty({
    description: '用户名'
  })
  @IsString()
  @Matches(/^\w{6,18}$/, { message: '请输入6-18个字符的字母/数字/下划线组成的用户名' }) // 6-18个字符，字母/数字/下划线组成
  readonly username: string;
}

// 验证邮箱实体
export class EmailDto {
  @ApiProperty({
    description: 'E-mail'
  })
  @IsString()
  @IsEmail({}, { message: '请输入正确的邮箱' })
  readonly email: string;
}

// 验证QQ号实体
export class QQDto {
  @ApiProperty({
    description: 'QQ号'
  })
  @IsString()
  @Matches(/^[1-9]{1}[0-9]{4,11}$/, { message: '请输入正确的QQ号' })
  readonly qq: string;
}

// 验证手机号码实体
export class MobileDto {
  @ApiProperty({
    description: '手机号码'
  })
  @IsString()
  @IsMobilePhone('zh-CN', { message: '请输入正确的手机号码' })
  readonly mobile: string;
}

// 验证金币实体
export class goldBuyDto {
  @ApiProperty({
    description: '金币'
  })
  @IsNumber()
  @Min(0)
  readonly gold: number;
}

// 整个用户信息实体
export class UserDto {
  @ApiProperty({
    description: '用户编号'
  })
  @IsInt()
  readonly id: number;

  @ApiProperty({
    description: '师傅编号'
  })
  @IsInt()
  readonly referrer_user_id: number;

  @ApiProperty({
    description: '师傅'
  })
  @IsString()
  readonly referrer_username: string;

  @ApiProperty({
    description: '推广数'
  })
  @IsInt()
  readonly referrer_num: number;

  @ApiProperty({
    description: '用户名'
  })
  @IsString()
  @Matches(/^\w{6,18}$/, { message: '请输入6-18个字符的字母/数字/下划线组成的用户名' }) // 6-18个字符，字母/数字/下划线组成
  readonly username: string;

  @ApiProperty({
    description: '密码'
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    default: 'E-mail'
  })
  @IsString()
  @IsEmail()
  readonly email: string

  @ApiProperty({
    description: 'QQ'
  })
  @IsString()
  @Matches(/^[1-9]{1}[0-9]{4,11}$/, { message: '请输入正确的QQ号' })
  readonly qq: string;

  @ApiProperty({
    description: '手机号码'
  })
  @IsString()
  @IsMobilePhone('zh-CN')
  readonly mobile: string;

  @ApiProperty({
    description: '安全密码'
  })
  @IsString()
  readonly password_security: string;

  @ApiProperty({
    description: '注册时间'
  })
  @IsDate()
  readonly create_time: Date;

  @ApiProperty({
    description: '最后登录时间'
  })
  @IsDate()
  readonly last_login_time: Date;

  @ApiProperty({
    description: '用户头像'
  })
  @IsString()
  readonly head_thumb: string;

  @ApiProperty({
    description: '角色（user：刷手，origin：创作者，admin：管理者）',
    enum: ['user', 'origin', 'admin'],
    default: ''
  })
  readonly role: string;

  @ApiProperty({
    description: '金币'
  })
  @IsNumber()
  readonly gold: number;

  @ApiProperty({
    description: '现金'
  })
  @IsNumber()
  readonly wealth: number;

  @ApiProperty({
    description: '是否被冻结'
  })
  @IsInt()
  readonly freeze_status: number;

  @ApiProperty({
    description: '冻结原因'
  })
  @IsString()
  readonly freeze_reason: string;

  @ApiProperty({
    description: '是否是VIP会员'
  })
  @IsInt()
  readonly isVip: number;

  @ApiProperty({
    description: '实名状态/审核状态'
  })
  @IsInt()
  readonly real_status: number;

  @ApiProperty({
    description: '实名审核不通过原因'
  })
  @IsInt()
  readonly real_reason: number;

  @ApiProperty({
    description: '真实姓名'
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: '身份证号码'
  })
  @IsString()
  readonly idcardno: string;

  @ApiProperty({
    description: '身份证正面'
  })
  @IsString()
  readonly idcard_src: string;

  @ApiProperty({
    description: '手持身份证半身照'
  })
  @IsString()
  readonly body_idcard_src: string;

  // @ApiProperty({
  //   description: '是否绑定了平台账号'
  // })
  // @IsInt()
  // readonly isPlatform: number;

}