import { PrimaryGeneratedColumn, Column, Entity, BaseEntity, Double } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '用户编号' })
  id: number;

  @Column({ type: 'bigint', comment: '师傅编号', nullable: true })
  referrer_user_id: number;

  @Column({ type: 'varchar', comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', comment: '密码' })
  password: string;

  @Column({ type: 'varchar', comment: 'E-mail' })
  email: string;

  @Column({ type: 'varchar', comment: '联系QQ' })
  qq: string;

  @Column({ type: 'varchar', comment: '手机号', length: 11 }) // length长度没生效
  mobile: string;

  @Column({ type: 'varchar', comment: '安全密码' })
  password_security: string;

  @Column({ type: 'timestamp', comment: '注册时间', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', comment: '最后登录时间', default: () => 'CURRENT_TIMESTAMP' })
  last_login_time: Date;

  @Column({ type: 'varchar', comment: '登录凭证' })
  token: string;

  @Column({ type: 'varchar', comment: '用户头像', default: '' })
  head_thumb: string;

  @Column({ type: 'tinyint', comment: '角色', default: 0 })
  role: number;

  @Column({ type: 'float', comment: '金币', default: 0, precision: 2 }) // precision精度没生效
  gold: number;

  @Column({ type: 'float', comment: '现金', default: 0, precision: 2 })
  wealth: number;

  @Column({ type: 'tinyint', comment: '是否被冻结', default: 0 })
  freeze_status: number;

  @Column({ type: 'varchar', comment: '冻结原因', default: '' })
  freeze_reason: string;

  @Column({ type: 'tinyint', comment: '是否是VIP会员', default: 0 })
  isVip: number;

  @Column({ type: 'tinyint', comment: '实名状态/审核状态', default: 0 })
  real_status: number;

  @Column({ type: 'tinyint', comment: '实名审核不通过原因' })
  real_reason: number;

  @Column({ type: 'varchar', comment: '真实姓名', default: '' })
  name: string;

  @Column({ type: 'varchar', comment: '身份证号码', default: '' })
  idcardno: string;

  @Column({ type: 'varchar', comment: '身份证正面', default: '' })
  idcard_src: string;

  @Column({ type: 'varchar', comment: '手持身份证半身照', default: '' })
  body_idcard_src: string;

}