/**
 * 实体定义，用于校验，swagger定义
 */

import { IsString, IsInt, IsBoolean, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // @ApiProperty()装饰器：对其进行注释，允许设计不同模式对象属性

export class AuthDto {

  @ApiProperty({
    // type: Number,
    description: '用户编号'
  })
  @IsInt()
  readonly id: number;

  @ApiProperty({
    // type: String,
    description: '用户姓名'
  })
  @IsString()
  @Length(0, 10, {
    message: '名字不能超过10个字符' // 错误信息
  })
  readonly name: string;

  @ApiProperty({
    // type: Number,
    description: '用户年龄'
  })
  @IsInt()
  readonly age: number;

  @ApiProperty({
    // enum: ['女', '男'],
    // required: false, // 确定属性是否是必填
    // type: Number, // 属性的类型（可以不设置，文档也可以显示类型）
    description: '用户性别', // 描述
    default: 0 // 默认值
  })
  // @IsBoolean()
  @IsInt()
  readonly sex: number;
}