import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Commission extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    comment: '佣金记录编号'
  })
  id: number;

  @Column({ type: 'bigint', comment: '用户编号' })
  user_id: number;

  @CreateDateColumn({ comment: '时间' })
  time: Date;

  @Column({ comment: '明细' })
  detail: string;

  @Column({ type: 'float', comment: '获取佣金', default: 0, scale: 2, precision: 10 })
  gold: number;
}