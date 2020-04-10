import { PrimaryGeneratedColumn, Column, Entity, BaseEntity, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Bank extends BaseEntity {
  // 是一个主列，该列将使用自动增量值自动生成，它将int使用auto-increment/serial/创建列sequence。您无需再保存之前手动分配其值-值将自动生成
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '银行账号编号' })
  id: number;

  // 多个银行账号对应一个用户
  // @ManyToOne(type => User, user => user.banks)
  // user: User;

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

  @Column({ comment: '银行卡号' })
  bank_num: string;

  @Column({ type: 'tinyint', comment: '状态（0 待审核/审核中，1 未通过（审核未通过），2 正常（审核已通过））', default: 0 })
  status: number;

  @Column({ comment: '审核不通过原因（当status为1时显示）', nullable: true })
  reason: string;

  // 是自动设置为实体的插入日期的特殊列，您无需设置此列-它会自动设置
  @CreateDateColumn()
  create_time: Date;
}