import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsNumber, IsDate, Min } from "class-validator";

// 一个类不能同时继承多个类，可以A继承B，C再继承A

// 充值审核实体
export class PayStatusDto {
  @ApiProperty({
    description: '充值编号'
  })
  @IsInt()
  readonly id: number

  @ApiProperty({
    description: '状态（0 已充值，待到账，1 充值失败，2 充值成功）',
    default: 0
  })
  @IsInt()
  readonly status: number
}

// 用户充值实体
export class PayCreateDto {
  @ApiProperty({
    description: '交易方'
  })
  @IsString()
  readonly account: string;

  @ApiProperty({
    description: '交易号'
  })
  @IsString()
  readonly deal_num: string;

  @ApiProperty({
    description: '充值类型（alipay：支付宝转账，bank：银行卡转账）',
    enum: ['alipay', 'bank'],
    default: 'alipay'
  })
  @IsString()
  readonly pay_type: string;

  @ApiProperty({
    description: '状态（0 已充值，待到账，1 充值失败，2 充值成功）'
  })
  @IsInt()
  readonly status: number;

  @ApiProperty({
    description: '充值详情（status为1时显示）',
    default: ''
  })
  // @IsString()
  readonly detail: string;

  @ApiProperty({
    description: '充值金额'
  })
  @IsNumber()
  @Min(0, { message: '充值金额不能少于0' })
  readonly wealth: number;

}

// 基础实体
export class PayDto extends PayCreateDto {
  @ApiProperty({
    description: '充值编号'
  })
  @IsInt()
  readonly id: number;

  @ApiProperty({
    description: '提交时间'
  })
  // @IsDate()
  readonly create_time: Date;

}