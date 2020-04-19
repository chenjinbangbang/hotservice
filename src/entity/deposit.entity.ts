import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";


@Entity()
export class Deposit extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '提现编号' })
  id: number;

  @Column({ type: 'bigint', comment: '用户编号' })
  user_id: number;

  @Column({ type: 'bigint', comment: '银行账号编号' })
  bank_id: number;

  @Column({ type: 'float', comment: '提现金额', default: 0, scale: 2, precision: 10 })
  wealth: number;

  @Column({ type: 'tinyint', comment: '提现状态（0：已提现，待到账（到账时间以各个银行提现速度为准），1：提现成功，已到账，2：提现失败，已退回）', default: 0 })
  status: number;

  @Column({ comment: '提现失败原因（提现状态为2时显示）', nullable: true })
  reason: string;

  @CreateDateColumn({ comment: '提现时间' })
  create_time: Date;
}