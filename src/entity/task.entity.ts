import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Task {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '任务编号' })
  id: number;

  @Column({ type: 'bigint', comment: '一级任务编号' })
  task_id: number;

  @Column({ type: 'tinyint', comment: '活动平台类型（0：今日头条，1：抖音短视频，2：火山小视频，3：快手）' })
  platform_type: number;

  @Column({ comment: '任务截图1' })
  task_img1: string;

  @Column({ comment: '任务截图2' })
  task_img2: string;


  @Column({ type: 'tinyint', comment: '任务状态（0：未开始，1：进行中，2：待审核，3：审核通过，4：审核不通过，5：已取消，6：违规）', default: 0 })
  status: number;

  @Column({ type: 'simple-array', comment: '审核不通过原因（可多选，0：没有关注，1：没有点赞，2：没有收藏，3：没有评论，4：有评论但和评论内容不符，5：没有转发，6：有转发但和转发内容不符）', nullable: true })
  status_reason: string[];

  @Column({ type: 'simple-array', comment: '审核不通过图片（可多张图片）', nullable: true })
  status_reason_imgs: string[];

  @Column({ type: 'timestamp', comment: '审核不通过时间', nullable: true })
  status_reason_time: Date;

  // @Column({ comment: '审核倒计时（24小时内，单位秒）', default: 24 * 60 * 60 })
  // countdown_time: number;

  @Column({ type: 'bigint', comment: '平台账号编号' })
  platform_id: number;

  @Column({ type: 'tinyint', comment: '任务活动入口（0：搜索账号进入）', default: 0 })
  task_entry: number;

  // @CreateDateColumn({ comment: '任务发布时间' })
  // publish_time: Date;
  @Column({ type: 'timestamp', comment: '任务发布时间' })
  publish_time: Date;

  @Column({ type: 'float', comment: '任务金币', default: 0, scale: 2, precision: 10 })
  gold: number;

  @Column({ type: 'bigint', comment: '发布创作者编号' })
  user_id: number;

  @Column({ type: 'bigint', comment: '接手用户编号', nullable: true })
  takeover_user_id: number;

  @Column({ type: 'bigint', comment: '接手平台账号编号', nullable: true })
  takeover_platform_id: number;

  @Column({ type: 'timestamp', comment: '接手时间', nullable: true })
  takeover_time: Date;

  // @Column({ comment: '任务预览时间', default: 60 })
  // preview_countdown_time: number;

  @Column({ type: 'tinyint', comment: '规定任务完成时间（0：10分钟，1：20分钟，2：30分钟，3：40分钟，4：50分钟 5：60分钟）', nullable: true })
  complete_countdown_time: number;

  @Column({ type: 'timestamp', comment: '任务完成时间', nullable: true })
  complete_time: Date;

  // @Column({ type: 'tinyint', comment: '是否关注（0：不关注，1：关注）', default: 1 })
  // attention: number;

  @Column({ type: 'tinyint', comment: '关注保留时间（0：3个月，1：半年，2：1年，3：2年，4：4年）', default: 0 })
  attention_time: number;

  // @Column({ type: 'tinyint', comment: '是否点赞（0：不点赞，1：点赞）', default: 1 })
  // give_like: number;

  // @Column({ type: 'tinyint', comment: '是否收藏（0：不收藏，1：收藏）', default: 1 })
  // collect: number;

  // @Column({ type: 'tinyint', comment: '是否评论（0：不评论，1：评论）', default: 1 })
  // comment: number;

  @Column({ comment: '评论内容', length: 50, default: '' })
  comment_content: string;

  @Column({ type: 'tinyint', comment: '是否转发（0：不转发，1：转发）', default: 0 })
  transpond: number;

  @Column({ type: 'tinyint', comment: '转发方式', nullable: true })
  transpond_type: number;

  @Column({ comment: '转发内容', length: 50, default: '' })
  transpond_content: string;

  @Column({ comment: '任务备注', length: 300, default: '' })
  remark: string;
}