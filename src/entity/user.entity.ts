import { PrimaryGeneratedColumn, Column, Entity, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pay } from './pay.entity';
import { Bank } from './bank.entity';
import { Platform } from './platform.entity';


// @Entity('my_users') // 自定义表名
@Entity()
export class User extends BaseEntity {
  // 是一个主列，该列将使用自动增量值自动生成，它将int使用auto-increment/serial/创建列sequence。您无需再保存之前手动分配其值-值将自动生成
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '用户编号' })
  id: number;

  // 一个用户有多个充值记录
  // @OneToMany(type => Pay, pay => pay.user)
  // pays: Pay[];

  // 一个用户有多张银行卡
  // @OneToMany(type => Bank, bank => bank.user)
  // banks: Bank[];

  // 一个用户有多个平台账号
  // @OneToMany(type => Platform, platform => platform.user)
  // platforms: Platform[];

  @Column({ type: 'bigint', comment: '师傅编号', nullable: true })
  referrer_user_id: number;

  @Column({ type: 'varchar', comment: '用户名', unique: true })
  username: string;

  @Column({ type: 'varchar', comment: '密码', select: false })
  password: string;

  @Column({ type: 'varchar', comment: 'E-mail', unique: true })
  email: string;

  @Column({ type: 'varchar', comment: '联系QQ', unique: true })
  qq: string;

  @Column({ type: 'varchar', comment: '手机号', unique: true, length: 11 }) // length长度没生效
  mobile: string;

  @Column({ type: 'varchar', comment: '安全密码' })
  password_security: string;

  // @Column({ type: 'timestamp', comment: '注册时间', default: () => 'CURRENT_TIMESTAMP' })
  // create_time: Date;

  // @Column({ type: 'timestamp', comment: '最后登录时间', default: () => 'CURRENT_TIMESTAMP' })
  // last_login_time: Date;

  @CreateDateColumn({ comment: '注册时间' })
  create_time: Date;

  @UpdateDateColumn({ comment: '最后登录时间' })
  last_login_time: Date;

  // 是自动设置为实体的插入日期的特殊列，您无需设置此列-它会自动设置
  // @CreateDateColumn()
  // createTime: Date;

  // 是一个特殊列，该列在您每次调用save实体管理器或存储库时自动设置为实体的更新时间。您无需设置此列-它会自动设置
  // @UpdateDateColumn()
  // updateTime: Date;

  @Column({ type: 'varchar', comment: '用户头像', default: '' })
  head_thumb: string;

  // @Column({ type: 'tinyint', comment: '角色', default: 0 })
  // role: number;
  @Column({ type: 'enum', enum: ['user', 'origin', 'admin'], default: 'user', comment: '用户角色（user：刷手，origin：创作者，admin：管理者）' })
  role: string

  @Column({ type: 'float', comment: '金币', default: 0, scale: 2, precision: 10 }) // scale：十进制列的比例，代表小数点右边的位数，并且不得大于精度。用于某些列类型
  gold: number;

  @Column({ type: 'float', comment: '现金', default: 0, scale: 2, precision: 10 })
  wealth: number;

  @Column({ type: 'tinyint', comment: '是否被冻结（0：正常，1：冻结）', default: 0 })
  freeze_status: number;

  @Column({ type: 'varchar', comment: '冻结原因', default: '' })
  freeze_reason: string;

  @Column({ type: 'tinyint', comment: '是否是VIP会员（0：不是，1：是）', default: 1 })
  isVip: number;

  @Column({ type: 'tinyint', comment: '实名状态/审核状态（0：未实名，1：待审核，2：审核不通过，3：已实名）', default: 0 })
  real_status: number;

  @Column({ type: 'tinyint', comment: '实名审核不通过原因', nullable: true })
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