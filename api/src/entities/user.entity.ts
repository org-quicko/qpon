import {
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '../constants';
import { OrganizationUser } from './organization-user.entity';
import { roleEnum } from '../enums';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column('enum', { enum: roleEnum })
  role: roleEnum;

  @CreateDateColumn({
    type: 'time with time zone',
    default: () => `now()`,
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'time with time zone',
    default: () => `now()`,
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToMany(
    () => OrganizationUser,
    (organizationUser) => organizationUser.user,
  )
  organizationUser: OrganizationUser[];

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
  }
}
