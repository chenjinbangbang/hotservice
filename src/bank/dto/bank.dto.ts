import { IsString, IsInt, IsDate, IsNumber, IsEmail, Min, Matches, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { pageDto } from 'src/common/dto';

// 添加银行卡实体
export class createBankDto {
  @ApiProperty({
    description: '开户行编号'
  })
  readonly bank_deposit_id: string;

  @ApiProperty({
    description: '开户省'
  })
  readonly bank_province: string;

  @ApiProperty({
    description: '开户市'
  })
  readonly bank_city: string;

  @ApiProperty({
    description: '开户区'
  })
  readonly bank_area: string;

  @ApiProperty({
    description: '开户支行名称'
  })
  readonly bank_branch: string;

  @ApiProperty({
    description: '银行卡号'
  })
  readonly bank_num: string;

  @ApiProperty({
    description: '开户人姓名'
  })
  @Matches(/^([\u4E00-\u9FA5]+|[a-zA-Z]+)$/, { message: '请输入有效的姓名' })
  readonly name: string;
}

// 修改银行卡实体
export class alterBankDto extends createBankDto {
  @ApiProperty({
    description: '银行卡编号'
  })
  readonly id: number;
}

// 审核是否通过实体
export class statusDto {
  @ApiProperty({
    description: '银行卡编号'
  })
  readonly id: number;

  @ApiProperty({
    description: '审核状态（0 待审核/审核中，1 未通过（审核未通过），2 正常（审核已通过））'
  })
  readonly status: number;

  @ApiProperty({
    description: '审核不通过原因'
  })
  readonly reason: string;
}