import { PrimaryGeneratedColumn, Column, Entity, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  referrer_user_id: number;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  qq: string;

  @Column({ type: 'varchar' })
  mobile: string;

  @Column({ type: 'varchar' })
  password_security: string;

  // @Column('date')
  // create_time: Date;

  // @Column('date')
  // last_login_time: string;

}