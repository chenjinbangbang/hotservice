import { PageDto } from "src/common/dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsInt, IsEmail, IsNotEmpty, Min, Max, MaxLength, IsNumberString } from "class-validator";

// 获取任务列表实体
export class TaskSearchDto extends PageDto {
  // 模糊搜索：任务编号（id），发布方（username），发布平台账号（platform_name），接手平台账号（takeover_platform_name）
  @ApiProperty({
    description: '任务编号',
    default: '',
    required: false
  })
  readonly id: string;

  @ApiProperty({
    description: '发布方',
    default: '',
    required: false
  })
  readonly username: string;

  @ApiProperty({
    description: '发布平台账号',
    default: '',
    required: false
  })
  readonly platform_name: string;

  @ApiProperty({
    description: '接手平台账号',
    default: '',
    required: false
  })
  readonly takeover_platform_name: string;

  // 精准搜索：平台类型（platform_type），任务状态（status）
  @ApiProperty({
    description: '平台类型（""：搜索全部，0：今日头条，1：抖音短视频，2：火山小视频，3：快手）',
    default: '',
    required: false
  })
  readonly platform_type: string;

  @ApiProperty({
    description: '任务状态（""：搜索全部，0：未开始，1：进行中，2：待审核，3：审核通过，4：审核不通过，5：已取消，6：违规）',
    default: '',
    required: false
  })
  readonly status: string;
}

// 更改任务状态实体
export class StatusDto {
  @ApiProperty({
    description: '任务编号'
  })
  @IsInt()
  readonly id: number;

  @ApiProperty({
    description: '任务状态（0：未开始，1：进行中，2：待审核，3：审核通过，4：审核不通过，5：已取消，6：违规）'
  })
  @IsInt()
  readonly status: number;

  @ApiProperty({
    description: '审核不通过原因（任务状态为4时必传）（可多选，0：没有关注，1：没有点赞，2：没有收藏，3：没有评论，4：有评论但和评论内容不符，5：没有转发，6：有转发但和转发内容不符）',
    required: false
  })
  readonly status_reason: number[];

  @ApiProperty({
    description: '审核不通过图片（任务状态为4时传，非必填）（可多张图片）',
    required: false
  })
  readonly status_reason_imgs: string[];
}

// 发布任务实体
export class PublishTaskDto {
  @ApiProperty({
    description: '活动平台（0：今日头条，1：抖音短视频，2：火山小视频，3：快手）',
    default: 0
  })
  @IsInt()
  readonly platform_type: number;

  @ApiProperty({
    description: '选择账号'
  })
  @IsInt()
  readonly platform_id: number;

  @ApiProperty({
    description: '任务截图1'
  })
  @IsNotEmpty({ message: '请上传任务截图1' })
  readonly task_img1: string;

  @ApiProperty({
    description: '任务截图2'
  })
  @IsNotEmpty({ message: '请上传任务截图1' })
  readonly task_img2: string;

  @ApiProperty({
    description: '活动入口（0：搜索账号进入）'
  })
  @IsInt()
  readonly task_entry: number;

  @ApiProperty({
    description: '任务完成时间（0：10分钟，1：20分钟，2：30分钟，3：40分钟，4：50分钟 5：60分钟）'
  })
  @IsInt()
  readonly complete_countdown_time: number;

  @ApiProperty({
    description: '发布任务数'
  })
  @IsInt()
  @Min(1, { message: '发布任务数必需1大于0' })
  readonly task_num: number;

  @ApiProperty({
    description: '关注保留时间（0：3个月，1：半年，2：1年，3：2年，4：4年）',
    default: 0
  })
  @IsInt()
  readonly attention_time: number;

  @ApiProperty({
    description: '评论内容'
  })
  readonly comment_content: string[];

  @ApiProperty({
    description: '是否转发'
  })
  @IsInt()
  readonly transpond: number;

  @ApiProperty({
    description: '转发内容'
  })
  readonly transpond_content: any[];

  @ApiProperty({
    description: '任务备注'
  })
  @MaxLength(300, { message: '任务备注不能超过300个字符' })
  readonly remark: string;

  @ApiProperty({
    description: '消耗金币总计'
  })
  readonly goldNum: number;
}

// 获取创作者任务列表实体
export class TaskListDto extends PageDto {
  @ApiProperty({
    description: '活动平台类型（""：搜索全部，0：今日头条，1：抖音短视频，2：火山小视频，3：快手）',
    default: '',
    required: false
  })
  readonly platform_type: string;

  @ApiProperty({
    description: '平台账号',
    default: '',
    required: false
  })
  readonly platform_id: string;

  @ApiProperty({
    description: '发布时间',
    type: [String],
    required: false
  })
  readonly publish_time: null | string[];
}

// 取消任务实体
export class TaskIdDto {
  @ApiProperty({
    description: '父任务编号'
  })
  @IsInt()
  readonly task_id: number;
}

// 获取某个父任务下的子任务列表实体
export class TaskDetailListDto extends PageDto {
  @ApiProperty({
    description: '父任务编号'
  })
  @IsNumberString()
  readonly task_id: number;

  @ApiProperty({
    description: '是否转发（""：搜索全部，0：不转发，1：转发）',
    default: '',
    required: false
  })
  readonly transpond: string;

  @ApiProperty({
    description: '任务状态（""：搜索全部，0：未开始，1：进行中，2：待审核，3：审核通过，4：审核不通过，5：已取消，6：违规）',
    default: '',
    required: false
  })
  readonly status: string;
}

// 获取可接任务列表实体
export class TaskSimpleDto extends PageDto {
  @ApiProperty({
    description: '活动平台类型（""：搜索全部，0：今日头条，1：抖音短视频，2：火山小视频，3：快手）',
    default: '',
    required: false
  })
  readonly platform_type: string;
}

// 抢任务实体
export class RobTaskDto {
  @ApiProperty({
    description: '父任务编号'
  })
  @IsInt()
  readonly task_id: number;

  @ApiProperty({
    description: '平台账号编号'
  })
  @IsInt()
  readonly platform_id: number;
}