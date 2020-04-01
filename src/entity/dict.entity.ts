import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Dict {
  @PrimaryGeneratedColumn({ comment: '编号' })
  id: number;

  @Column({ comment: '字典码' })
  dict_code: string;

  @Column({ comment: '字典名称' })
  dict_name: string;

  @Column({ comment: '字典key' })
  code_index: string

  @Column({ comment: '字典value-中文' })
  index_name_cn: string;

  @Column({ comment: '字典value-英文', nullable: true, default: '' })
  index_name_en: string;

  @CreateDateColumn({ comment: '字典创建时间' })
  create_time: Date

}