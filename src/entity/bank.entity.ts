import { PrimaryGeneratedColumn, Column, Entity, BaseEntity, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Bank extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '银行账号编号' })
  id: number;

  // 多个银行账号对应一个用户
  // @ManyToOne(type => User, user => user.banks)
  // user: User;

  // 对应用户id
  @Column({ type: 'bigint', comment: '用户id' })
  user_id: number;

  @Column({ comment: '开户人姓名' })
  name: string;

  @Column({ comment: '开户行编号' })
  bank_deposit_id: string;

  @Column({ comment: '开户省' })
  bank_province: string;

  @Column({ comment: '开户市' })
  bank_city: string;

  @Column({ comment: '开户区' })
  bank_area: string;

  @Column({ comment: '开户支行名称' })
  bank_branch: string;

  @Column({ comment: '银行卡号', unique: true })
  bank_num: string;

  @Column({ type: 'tinyint', comment: '状态（0 待审核/审核中，1 未通过（审核未通过），2 正常（审核已通过））', default: 0 })
  status: number;

  @Column({ type: 'tinyint', comment: '审核不通过原因（0：开户行与银行卡信息不对应，1：开户姓名与银行卡信息不对应，2：银行卡号填写有误当）（status为1时显示）' })
  reason: number;

  @CreateDateColumn({ comment: '创建时间' })
  create_time: Date;
}