
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsMobilePhone, IsEmail, Matches } from "class-validator";

// 登录实体
export class LoginDto {
  @ApiProperty({
    description: '用户名'
  })
  @IsString()
  @Matches(/^\w{6,18}$/) // 6-18个字符，字母/数字/下划线组成
  readonly username: string;

  @ApiProperty({
    description: '密码'
  })
  @IsString()
  @Matches(/^\w{8,18}$/) // 8-18个字符，字母/数字/下划线组成
  readonly password: string;
}

// 注册实体
export class RegisterDto {
  @ApiProperty({
    description: '师傅编号',
    required: false,
    nullable: true
  })
  readonly referrer_user_id: number;

  @ApiProperty({
    description: '角色（user：刷手，origin：创作者，admin：管理者）',
    enum: ['user', 'origin'],
    default: 'user'
  })
  @IsString()
  readonly role: string;

  @ApiProperty({
    description: '用户名'
  })
  @IsString()
  @Matches(/^\w{6,18}$/, { message: '用户名由6-18个字符，字母/数字/下划线组成' }) // 6-18个字符，字母/数字/下划线组成
  readonly username: string;

  @ApiProperty({
    description: '密码'
  })
  @IsString()
  @Matches(/^\w{8,18}$/, { message: '密码由8-18个字符，字母/数字/下划线组成' }) // 8-18个字符，字母/数字/下划线组成
  readonly password: string;

  @ApiProperty({
    description: '确认密码'
  })
  @IsString()
  @Matches(/^\w{8,18}$/, { message: '确认密码由8-18个字符，字母/数字/下划线组成' }) // 8-18个字符，字母/数字/下划线组成
  readonly password_confirm: string;

  @ApiProperty({
    description: 'E-mail'
  })
  @IsString()
  @IsEmail({}, { message: '请输入正确的邮箱' })
  readonly email: string;

  @ApiProperty({
    description: 'QQ'
  })
  @IsString()
  @Matches(/^[1-9]{1}[0-9]{4,11}$/, { message: '请输入正确的QQ号' }) // QQ号码正则
  readonly qq: string;

  @ApiProperty({
    description: '手机号码'
  })
  @IsString()
  @IsMobilePhone('zh-CN', { message: '请输入正确的手机号码' })
  readonly mobile: string;

  @ApiProperty({
    description: '安全密码'
  })
  @IsString()
  @Matches(/^\w{8,18}$/, { message: '安全密码由8-18个字符，字母/数字/下划线组成' }) // 8-18个字符，字母/数字/下划线组成
  readonly password_security: string;

  @ApiProperty({
    description: '确认安全密码'
  })
  @IsString()
  @Matches(/^\w{8,18}$/, { message: '确认安全密码由8-18个字符，字母/数字/下划线组成' }) // 8-18个字符，字母/数字/下划线组成
  readonly password_security_confirm: string;
}