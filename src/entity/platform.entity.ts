import { PrimaryGeneratedColumn, Column, Entity, BaseEntity, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Platform extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '平台账号编号' })
  id: number;

  // 多个平台账号对应一个用户
  // @ManyToOne(type => User, user => user.platforms)
  // user: User;

  // 对应用户id
  @Column({ type: 'bigint', comment: '用户id' })
  user_id: number;

  @Column({ comment: '平台账号名称' })
  platform_name: string;

  @Column({ type: 'tinyint', comment: '平台类型（0：今日头条 1：抖音短视频 2 火山小视频，3 快手）', default: 0 })
  platform_type: number;

  @Column({ comment: '平台账号头像' })
  platform_head_thumb: string;

  @Column({ comment: '平台账号截图' })
  platform_image_src: string;

  @Column({ type: 'tinyint', comment: '平台账号审核/冻结状态（0：待审核 1：未通过（审核未通过） 2：正常（审核已通过） 3：已冻结）', default: 0 })
  status: number;

  @Column({ type: 'tinyint', comment: '平台账号审核不通过原因（0：平台不存在该账号 1：平台账号头像与账号不对应 2：平台账号截图和填写的信息不对应）（平台账号审核/冻结状态为1时使用）', nullable: true })
  reason: number;

  @Column({ type: 'tinyint', comment: '冻结原因（0：违规账号[同一用户同一平台账号名称是否冻结]）（审核/冻结状态为3时使用）', nullable: true })
  freeze_reason: number;

  @CreateDateColumn()
  create_time: Date;
}