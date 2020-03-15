import { IsString, IsInt, IsBoolean, Length, IsDate, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDtoList {

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
  readonly username: string;

  @ApiProperty({
    description: '密码'
  })
  @IsString()
  readonly password: string;

  @ApiProperty({
    description: 'E-mail'
  })
  @IsString()
  readonly email: string;

  @ApiProperty({
    description: 'QQ'
  })
  @IsString()
  readonly qq: string;

  @ApiProperty({
    description: '手机号码'
  })
  @IsString()
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
    description: '登录凭证'
  })
  @IsString()
  readonly token: string;

  @ApiProperty({
    description: '用户头像'
  })
  @IsString()
  readonly head_thumb: string;

  @ApiProperty({
    description: '角色'
  })
  @IsInt()
  readonly role: number;

  @ApiProperty({
    description: '金币'
  })
  @IsInt()
  readonly gold: number;

  @ApiProperty({
    description: '现金'
  })
  @IsInt()
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

  @ApiProperty({
    description: '是否绑定了平台账号'
  })
  @IsInt()
  readonly isPlatform: number;

}