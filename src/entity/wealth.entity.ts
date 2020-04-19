import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";


@Entity()
export class Wealth extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '财务明细编号' })
  id: number;

  @Column({ type: 'bigint', comment: '用户编号' })
  user_id: number;

  @CreateDateColumn({ comment: '时间' })
  time: Date;

  @Column({ type: 'tinyint', comment: '类型' })
  type: number;

  @Column({ comment: '详情' })
  detail: string;

  @Column({ type: 'tinyint', comment: '金币变化类型（0：减少，1：增加）' })
  change_gold_type: number;

  @Column({ type: 'float', comment: '金币变化' })
  change_gold: number;

  @Column({ type: 'float', comment: '剩余金币' })
  gold: number;

  @Column({ type: 'tinyint', comment: '现金变化类型（0：减少，1：增加）' })
  change_wealth_type: number;

  @Column({ type: 'float', comment: '现金变化' })
  change_wealth: number;

  @Column({ type: 'float', comment: '剩余现金' })
  wealth: number;

}