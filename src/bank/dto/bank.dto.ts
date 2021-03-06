import { IsString, IsInt, IsDate, IsNumber, IsEmail, Min, Matches, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from 'src/common/dto';

// 获取银行卡列表实体
export class SearchBankDto extends PageDto {
  // 模糊搜索：用户名(username)，姓名(name)，银行卡号(bank_num)
  @ApiProperty({
    // required: false,
    description: '查询关键字，模糊搜索（用户名，姓名，银行卡号）',
  })
  @IsString()
  readonly search: string;

  @ApiProperty({
    description: '审核状态（""：搜索全部，0：待审核/审核中，1：未通过（审核未通过），2：正常（审核已通过））'
  })
  readonly status: number;

  @ApiProperty({
    description: '审核不通过原因'
  })
  readonly reason: string;

  @ApiProperty({
    description: '创建时间',
    required: false,
    nullable: true,
    type: [String]
  })
  // @IsArray()
  readonly create_time: null | string[];
}

// 添加银行卡实体
export class CreateBankDto {
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
export class AlterBankDto extends CreateBankDto {
  @ApiProperty({
    description: '银行卡编号'
  })
  readonly id: number;
}

// 审核状态是否通过实体
export class StatusBankDto {
  @ApiProperty({
    description: '银行卡编号'
  })
  readonly id: number;

  @ApiProperty({
    description: '审核状态（1：未通过（审核未通过），2：正常（审核已通过））'
  })
  readonly status: number;

  @ApiProperty({
    description: '审核不通过原因（0：开户行与银行卡信息不对应，1：开户姓名与银行卡信息不对应，2：银行卡号填写有误当）（审核状态为1时必传）',
    required: false
  })
  readonly reason: number;
}