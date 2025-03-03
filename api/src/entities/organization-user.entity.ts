import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { roleEnum } from '../enums';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity({ name: 'organization_user' })
export class OrganizationUser {
  @PrimaryColumn({ name: 'organization_id' })
  organizationId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @Column()
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

  @ManyToOne(
    () => Organization,
    (organization) => organization.organizationUser,
  )
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organizationId',
  })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.organizationUser)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user: User;
}
