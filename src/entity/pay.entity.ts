import { Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Pay extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '充值编号' })
  id: number;

  // 多个充值记录对应一个用户
  @ManyToOne(type => User, user => user.pays)
  user: User;

  @Column({ comment: '交易方' })
  account: string;

  @Column({ comment: '交易号' })
  deal_num: string;

  @Column({ type: 'enum', enum: ['alipay', 'bank'], default: 'alipay', comment: '充值类型（alipay：支付宝转账，bank：银行卡转账）' })
  pay_type: string;

  @Column({ comment: '状态（0 已充值，待到账，1 充值失败，2 充值成功）' })
  status: number;

  @Column({ comment: '充值详情（status为1时显示）', default: '' })
  detail: string;

  @Column({ type: 'float', comment: '充值金额', default: 0, scale: 2, precision: 10 })
  wealth: number;

  @Column({ type: 'timestamp', comment: '提交时间', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;
}