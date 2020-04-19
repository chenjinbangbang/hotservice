import { PageDto } from "src/common/dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

// 获取提现列表实体
export class SearchDepositDto extends PageDto {
  // 模糊搜索：用户名(username)，银行卡号(bank_num)
  @ApiProperty({
    required: false,
    description: '查询关键字，模糊搜索（用户名，银行卡号）'
  })
  readonly search: string;

  @ApiProperty({
    required: false,
    description: '提现状态（""：搜索全部，0：已提现，待到账，1：提现成功，已到账，2：提现失败，已退回）'
  })
  readonly status: number;

  @ApiProperty({
    description: '创建时间',
    required: false,
    nullable: true,
    type: [String]
  })
  readonly create_time: null | string[];
}

// 更改提现状态实体
export class StatusDepositDto {
  @ApiProperty({
    description: '提现编号'
  })
  readonly id: number;

  @ApiProperty({
    description: '提现状态（1：提现成功，已到账，2：提现失败，已退回）'
  })
  readonly status: number;

  @ApiProperty({
    description: '提现失败原因（提现状态为2时必传）',
    required: false
  })
  readonly reason: string;
}