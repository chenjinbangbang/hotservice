import { IsString, IsInt, IsBoolean, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

}