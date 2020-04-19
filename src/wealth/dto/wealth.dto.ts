import { PageDto } from "src/common/dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

// 获取用户列表实体
export class SearchWealthDto extends PageDto {
  @ApiProperty({
    description: '起止时间',
    required: false,
    nullable: true,
    type: [String]
  })
  readonly time: null | string[];

  @ApiProperty({
    description: '类型（"": 搜索全部，详细请查看财务明细类型字典表）',
    required: false,
    nullable: true
  })
  readonly type: number;

}