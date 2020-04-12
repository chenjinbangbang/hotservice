import { IsString, IsInt, IsDate, IsNumber, IsEmail, Min, Matches, IsMobilePhone, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from 'src/common/dto';

// 获取银行卡列表实体
export class SearchPlatformDto extends PageDto {
  // 模糊搜索：用户名(username)，平台账号名称(platform_name)
  @ApiProperty({
    // required: false,
    description: '查询关键字，模糊搜索（用户名，平台账号名称）',
  })
  @IsString()
  readonly search: string;

  @ApiProperty({
    description: '平台类型（"": 搜索全部，0：今日头条 1：抖音短视频 2：火山小视频，3：快手）'
  })
  readonly platform_type: number;

  @ApiProperty({
    description: '平台账号审核/冻结状态（"": 搜索全部，0：待审核 1：未通过 2：正常 3：已冻结）'
  })
  readonly status: number;

  @ApiProperty({
    description: '平台账号审核不通过原因（"": 搜索全部，0：平台不存在该账号 1：平台账号头像与账号不对应 2：平台账号截图和填写的信息不对应）'
  })
  readonly reason: number;

  @ApiProperty({
    description: '冻结原因（"": 搜索全部，0：违规账号）'
  })
  readonly freeze_reason: number;

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
export class CreatePlatformDto {
  @ApiProperty({
    description: '平台账号类型',
    default: 0
  })
  readonly platform_type: number;

  @ApiProperty({
    description: '平台账号名称'
  })
  @MaxLength(50, { message: '平台账号名称不能超过50个字符' })
  readonly platform_name: string;

  @ApiProperty({
    description: '平台账号头像'
  })
  readonly platform_head_thumb: string;

  @ApiProperty({
    description: '平台账号截图'
  })
  readonly platform_image_src: string;
}

// 修改银行卡实体
export class AlterPlatformDto extends CreatePlatformDto {
  @ApiProperty({
    description: '平台账号编号'
  })
  readonly id: number;
}

// 审核状态是否通过实体
export class StatusDto {
  @ApiProperty({
    description: '平台账号编号'
  })
  readonly id: number;

  @ApiProperty({
    description: '审核状态（1：未通过（审核未通过），2：正常（审核已通过））'
  })
  readonly status: number;

  @ApiProperty({
    description: '审核不通过原因（审核状态为1时必传）',
    required: false
  })
  readonly reason: string;
}