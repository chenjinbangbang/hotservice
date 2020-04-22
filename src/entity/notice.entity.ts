import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Notice extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '公告编号' })
  id: number;

  @Column({ type: 'enum', enum: ['admin'], comment: '发送者（admin：系统管理员）', default: 'admin' })
  sender: string;

  @Column({ type: 'set', enum: ['user', 'origin'], comment: '接收者（user：用户，origin：创作者）' })
  receiver: string[];

  @Column({ comment: '公告标题' })
  title: string;

  @Column({ comment: '公告内容' })
  content: string;

  @CreateDateColumn({ comment: '时间' })
  time: Date;
}